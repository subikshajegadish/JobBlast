from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
import logging
from .models import JobApplication
from .serializers import JobApplicationSerializer

logger = logging.getLogger(__name__)


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'company']
    search_fields = ['job_title', 'company', 'location']
    ordering_fields = ['date_applied', 'created_at', 'company']
    ordering = ['-date_applied']

    def get_queryset(self):
        # Only return applications for the authenticated user
        return JobApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # User is set in serializer.create, but ensure it here too
        serializer.save(user=self.request.user)

    def get_object(self):
        # Ensure user can only access their own applications
        obj = super().get_object()
        if obj.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only access your own applications.")
        return obj

