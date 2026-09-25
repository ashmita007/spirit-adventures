from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from adventures.api import api

admin.site.site_header = "Spirit Adventures Admin"
admin.site.site_title = "Spirit Adventures Portal"
admin.site.index_title = "Adventure Management & Bookings"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', api.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
