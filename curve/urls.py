from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'curve.views.go'),
    # url(r'^curve/', include('curve.foo.urls')),
    url(r'^home$', include('home.urls')),
    url(r'^welcome$', include('introduction.urls')),
    url(r'^member/', include('member.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
