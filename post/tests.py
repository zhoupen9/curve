#!/usr/bin/python ../manage.py test post
"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from datetime import datetime
from django.test import TransactionTestCase
from member.models import Member
from post.models import Post

import logging

logger = logging.getLogger('curve')

class PostTest(TransactionTestCase):
    def test_create_post(self):
	"""
	Test create a post.
	"""
	member = Member.objects.create_member('z1', 'zhoup3ng@yahoo.com', 's3cr3t')
	if member is not None:
	    create_time = datetime.utcnow()
	    post = Post.objects.create_post(member, 'hello', 'hello world.', create_time)
	    logger.debug('post create result: %s.', post is not None and post.id or 'failed')
	else:
	    self.assertTrue(False)

	posts = Post.objects.get_posts_by_author(member)
	self.assertTrue(posts is not None)

        for p in posts:
            logger.debug("Post: %s, title; %s, content: %s", p.id, p.title, p.content)
