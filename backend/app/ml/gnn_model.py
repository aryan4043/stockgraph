try:
    import torch
    import torch.nn as nn
    from torch_geometric.nn import GATConv
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    # Mock classes for when torch is missing
    class MockModule:
        def __init__(self, *args, **kwargs): pass
        def __call__(self, *args, **kwargs): return None
    
    nn = type('nn', (), {'Module': object, 'Linear': MockModule})
    GATConv = MockModule

class StockGNN(nn.Module):
    def __init__(self, input_dim, hidden_dim=64):
        super().__init__()
        if TORCH_AVAILABLE:
            self.gat1 = GATConv(input_dim, hidden_dim, heads=4)
            self.gat2 = GATConv(hidden_dim*4, hidden_dim, heads=4)
            self.fc = nn.Linear(hidden_dim*4, 1)
    
    def forward(self, x, edge_index):
        if not TORCH_AVAILABLE:
            return None
        x = torch.relu(self.gat1(x, edge_index))
        x = torch.relu(self.gat2(x, edge_index))
        return self.fc(x)
