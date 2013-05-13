
from django.shortcuts import redirect

def go(request):
    if request.user.is_authenticated():
        print '..........................................'
        print 'user name:', request.user.username, ' email:', request.user.email
        #return redirect('/home')
        return redirect('/welcome')
    else:
        return redirect('/welcome')
