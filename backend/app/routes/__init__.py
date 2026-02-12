from .inventory import router as inventory_router
from .students import router as students_router
from .schools import router as schools_router
from .optimize import router as optimize_router

__all__ = ["inventory_router", "students_router", "schools_router", "optimize_router"]
