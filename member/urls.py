
from django.conf.urls import patterns, url

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'curve.views.home', name='home'),
    # url(r'^curve/', include('curve.foo.urls')),
    url(r'^register/$', 'member.views.register'),
    url(r'^login/$', 'member.views.signin'),
)
