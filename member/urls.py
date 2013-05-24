
from django.conf.urls import patterns, url

urlpatterns = patterns(
    'member.views',
    # Examples:
    # url(r'^$', 'curve.views.home', name='home'),
    # url(r'^curve/', include('curve.foo.urls')),
    url(r'^register$', 'register'),
)
