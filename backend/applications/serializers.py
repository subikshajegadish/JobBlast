from rest_framework import serializers
import logging
from .models import JobApplication

logger = logging.getLogger(__name__)


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['id', 'job_title', 'company', 'location', 'date_applied', 
                  'job_link', 'status', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        try:
            # Ensure user is set from request context
            validated_data['user'] = self.context['request'].user
            logger.info(f"Creating application for user {validated_data['user'].username}")
            instance = super().create(validated_data)
            logger.info(f"Successfully created application {instance.id}")
            return instance
        except Exception as e:
            logger.error(f"Error creating job application: {str(e)}", exc_info=True)
            raise

    def update(self, instance, validated_data):
        try:
            # Ensure user can only update their own applications
            if instance.user != self.context['request'].user:
                raise serializers.ValidationError("You can only update your own applications.")
            return super().update(instance, validated_data)
        except Exception as e:
            logger.error(f"Error updating job application: {str(e)}", exc_info=True)
            raise
