from django.conf.urls import patterns, include, url
from django.contrib import admin
from settings import MEDIA_ROOT
admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'^$', 'curve.views.home'),
    url(r'^signin$', 'curve.views.signin'),
    url(r'^signout$', 'curve.views.signout'),
    # url(r'^curve/', include('curve.foo.urls')),
    url(r'^home$', include('home.urls')),
    url(r'^member/', include('member.urls')),
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    # static media access.
    # url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': path.join(path.dirname(__file__), 'media')}),
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', { 'document_root': MEDIA_ROOT }),
)
