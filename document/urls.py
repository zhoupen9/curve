from django.conf.urls import patterns, url

urlpatterns = patterns(
    'document.views',
    url(r'^$', 'recent'),
)
