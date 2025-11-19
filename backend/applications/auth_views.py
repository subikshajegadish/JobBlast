from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    User registration endpoint.
    POST /api/register/
    Body: {
        "username": "string",
        "password": "string",
        "email": "string" (optional)
    }
    """
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')

        # Validation
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )

        logger.info(f"User registered: {username}")

        return Response(
            {'success': True, 'message': 'User registered successfully', 'user_id': user.id},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

