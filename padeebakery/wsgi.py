"""
WSGI config for padeebakery project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os,sys,site

from django.core.wsgi import get_wsgi_application

#sys.path.append('D:/Python/projects/padeebakery')
#sys.path.append('D:/Python/projects/padeebakery/padeebakery')
os.environ["DJANGO_SETTINGS_MODULE"] =  'padeebakery.settings'

application = get_wsgi_application()
