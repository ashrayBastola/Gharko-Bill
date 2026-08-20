from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/households/', include('apps.family.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/bills/', include('apps.bills.urls')),
    path('api/documents/', include('apps.expenses.urls')),
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/warranties/', include('apps.warranties.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/activity/', include('apps.core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
