from django.conf.urls import patterns, include, url
from django.contrib import admin
from settings import MEDIA_ROOT

# admin site auto discover.
admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'^$', 'curve.views.mainpage'),
    url(r'^signin$', 'curve.views.signin'),
    url(r'^signout$', 'curve.views.signout'),
    # url(r'^connect$', 'curve.views.connect'),
    # url(r'^curve/', include('curve.foo.urls')),
    url(r'^home', include('home.urls')),
    url(r'^member/', include('member.urls')),
    url(r'^post/', include('post.urls')),
    url(r'^connection/', include('connection.urls')),
    url(r'^blog', include('blog.urls')),
    # Uncomment the admin/doc line below to enable admin documentation.
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin.
    url(r'^admin/', include(admin.site.urls)),
    # static media access.
    # url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': path.join(path.dirname(__file__), 'media')}),
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', { 'document_root': MEDIA_ROOT }),
)
