from django.contrib import admin
from django.urls import path, re_path
from django.views.static import serve
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

# Admin uploads (when Cloudinary is not configured). static() only works with DEBUG on,
# and there is no separate file server in this container, so serve them directly.
urlpatterns += [re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT})]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
