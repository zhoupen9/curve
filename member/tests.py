"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TransactionTestCase
import logging
from member.models import Member

logger = logging.getLogger('curve')

class RegisterTest(TransactionTestCase):
    def testRegister(self):
        member = Member.objects.create_member("z1", "z1@example.com", "s3cr3t")
        if member is not None:
            logger.debug("register succeed.")
        else:
            logger.error("failed to register.")
