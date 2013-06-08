
from django.conf.urls import patterns, url

urlpatterns = patterns(
    'post.views',
    # view user posts.
    url(r'^create$', 'create'),
    url(r'^usr/(\d)/(\d)$', 'userposts'),
    url(r'^recent$', 'recent'),
)
