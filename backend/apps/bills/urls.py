from django.urls import path

from .views import BillListCreateView, BillProofCreateView, BillProofVerifyView

urlpatterns = [
    path("", BillListCreateView.as_view(), name="bill_list_create"),
    path("proofs/", BillProofCreateView.as_view(), name="bill_proof_create"),
    path("proofs/<uuid:pk>/verify/", BillProofVerifyView.as_view(), name="bill_proof_verify"),
]
