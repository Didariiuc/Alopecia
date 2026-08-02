import io
import os
import math
import torch
import torch.nn as nn
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from torchvision import models, transforms

# 1. Initialize FastAPI Application
app = FastAPI(title="Automated Trichoscopy Analysis API", version="2.5")

# 2. Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Target Classes directly matching Kaggle dataset
class_names = ['alopecia_areata', 'alopecia_totalis', 'androgenetic_alopecia']
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 4. Construct EfficientNet-B0 Architecture matching Kaggle training
model = models.efficientnet_b0(weights=None)
num_ftrs = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_ftrs, len(class_names))

# 5. Load Weight Checkpoint
model_filename = 'alopecia_detector.pth'
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, model_filename)

if not os.path.exists(model_path):
    model_path = model_filename

try:
    model.load_state_dict(torch.load(model_path, map_location=device, weights_only=False))
    model.to(device)
    model.eval()
    print(f"SUCCESS: Model weights loaded successfully from {model_path}")
except Exception as e:
    import traceback
    print("ERROR: Failed to load model weights. Traceback:")
    traceback.print_exc()

# 6. Tensor Transformation Matching PyTorch valid_test transforms
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        request_object_content = await file.read()
        image = Image.open(io.BytesIO(request_object_content)).convert('RGB')
        
        # Preprocess and execute forward pass
        input_tensor = preprocess(image)
        input_batch = input_tensor.unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(input_batch)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            
        top_prob, top_class_idx = torch.max(probabilities, 0)
        confidence_score = round(top_prob.item() * 100, 2)
        
        # Calculate Prediction Entropy H(P)
        entropy = 0.0
        for p in probabilities:
            p_val = p.item()
            if p_val > 0:
                entropy -= p_val * math.log(p_val)
                
        detailed_analysis = {}
        for idx, name in enumerate(class_names):
            clean_name = name.replace("_", " ").title()
            detailed_analysis[clean_name] = round(probabilities[idx].item() * 100, 2)

        # =============================================================
        # FIX FOR OUT-OF-DISTRIBUTION (OOD) / NON-ALOPECIA PHOTOS
        # =============================================================
        CONFIDENCE_THRESHOLD = 80.0  # Must have >= 80% confidence
        MAX_ENTROPY_LIMIT = 0.85     # High uncertainty signifies non-trichoscopy image

        if confidence_score < CONFIDENCE_THRESHOLD or entropy > MAX_ENTROPY_LIMIT:
            return {
                "success": True,
                "is_valid_alopecia": False,
                "diagnosis": "Non-Alopecia / Invalid Image",
                "confidence": confidence_score,
                "detailed_analysis": detailed_analysis,
                "message": "The uploaded image does not match valid alopecia trichoscopy patterns."
            }

        return {
            "success": True,
            "is_valid_alopecia": True,
            "diagnosis": class_names[top_class_idx.item()].replace("_", " ").title(),
            "confidence": confidence_score,
            "detailed_analysis": detailed_analysis
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}