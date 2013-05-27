"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TransactionTestCase
import logging
from member.models import register

logger = logging.getLogger('curve')

class RegisterTest(TransactionTestCase):
    def testRegister(self):
        success, message = register("z1", "z1@example.com", "s3cr3t")
        if success is True:
            logger.debug("register succeed.")
        else:
            logger.error("failed to register, cause:", message)
