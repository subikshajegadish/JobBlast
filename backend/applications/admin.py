from django.contrib import admin
from .models import JobApplication


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['job_title', 'company', 'status', 'date_applied', 'user']
    list_filter = ['status', 'date_applied']
    search_fields = ['job_title', 'company', 'user__username']

