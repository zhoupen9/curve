
from django.contrib.auth.decorators import login_required
# from django.contrib.auth.models import User
from django.shortcuts import render
# from django.template import Template
from django.views.decorators.http import require_http_methods
from member.models import Member
from datetime import datetime
from models import Post

import logging

logger = logging.getLogger('curve')

@login_required
@require_http_methods
def publish_post(request):
    pass

@login_required
def userposts(request, userid, startid, limit=10):
    """
    Get user's posts which id less than start id with max count (default 10).
    """
    posts = Post.objects.filter(user=userid).filter(id__lte=startid).orderby('createTime')
    html = []
    for post in posts:
        # render post to create html.
        html.append(render(request, '', { 'post': post }))

    return html

@login_required
def recent(request):
    # user = User.objects.get(pk=request.session['userid'])
    member = Member.objects.get(user_id=request.session['userid'])
    post = create_post(member)
    return render(request, 'post/post.html', { 'post': post })
    
def create_post(member):
    post = Post(id=1, title='foobar', createTime=datetime.now(), member=member, content="It's a post, hah!")
    return post
