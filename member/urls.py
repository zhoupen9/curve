
from django.conf.urls import patterns, url

urlpatterns = patterns(
    'member.views',
    url(r'^signup$', 'register'),
)
