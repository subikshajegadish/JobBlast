from django.db import models
from django.contrib.auth.models import User


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Interview', 'Interview'),
        ('Offer', 'Offer'),
        ('Rejected', 'Rejected'),
        ('Ghosted', 'Ghosted'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job_title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True, null=True)
    date_applied = models.DateField()
    job_link = models.URLField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_applied', '-created_at']

    def __str__(self):
        return f"{self.job_title} at {self.company}"

