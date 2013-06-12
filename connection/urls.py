from django.conf.urls import patterns, url

urlpatterns = patterns(
    'connection.views',
    # url(r'^poll$', 'poll'),
    # url(r'^notify$', 'notify'),
    url(r'^connect$', 'connect'),
    url(r'^request$', 'request'),
)
