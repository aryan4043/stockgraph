import os
try:
    import torch
    from .gnn_model import StockGNN
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("Warning: Torch not available. Running in mock mode.")

class StockPredictor:
    def __init__(self, model_path="models/best_model.pth"):
        if TORCH_AVAILABLE:
            # 30 days * 3 features (Open, Close, Volume) = 90
            self.model = StockGNN(input_dim=90)
            
            if os.path.exists(model_path):
                self.model.load_state_dict(torch.load(model_path))
                print(f"Loaded model from {model_path}")
            else:
                print(f"Warning: Model not found at {model_path}. Using initialized weights.")
            
            self.model.eval()
        else:
            self.model = None
    
    def predict(self, stock_data, graph_data):
        # Mock prediction for now if no model or data
        if not TORCH_AVAILABLE or self.model is None or stock_data is None or graph_data is None:
            return 100.0 # Dummy value
            
        with torch.no_grad():
            prediction = self.model(stock_data, graph_data)
        return prediction.item()
