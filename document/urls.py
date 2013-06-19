from django.conf.urls import patterns, url

urlpatterns = patterns(
    'document.views',
    url(r'^recent$', 'recent'),
    url(r'(\d+)$', 'open'),
    url(r'^user/(\d+)$', 'user_documents'),
)
