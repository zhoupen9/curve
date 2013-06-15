# -*- coding: utf-8 -*-
import json
import logging

logger = logging.getLogger('curve')

FIELDS_ATTRIBUTE = '__json_fields__'

class SimpleJSONEncoder(json.JSONEncoder):
    """
    A simple json encoder which helps to encode object besides json supported types.
    Given object will be encode in a dict, so json will output in format of 
    { 'foo': 'bar' }
    Non-ASCII texts will be outputed as unicode string meaning that client need
    to decode them. E.G. javascript can do that by
    JSON.parse(data)

    This simple json encoder do the encoding by try convert target into a dict,
    which need classes besides json supported types must implement __iter__() method.

    E.G.

    class Foo(object):
        # all json output fields, if there is only one field need to
        # be encoded to json, there must be an empty trial comma.
        __json_fields__ = ('bar', )
        
        def __init__(self):
            self.bar = '中文'
        pass
    pass
    
    The '__json_fields__' supports fullpath style, e.g. 'a.b.c' means to output
    'c' of 'b' of 'a' of given object. It should be notcied that output of 
    'a.b.c' would be { "a.b.c": some_value }.
    """
    def default(self, obj):
        """ Implement own default encoding. """
        if obj is None:
            return {}
        
        try:
            iterable = iter(obj)
        except TypeError:
            iterable = self.makeIterable(obj)
            return dict(iterable)
        else:
            return dict(iterable)

        return json.JSONEncoder.default(self, obj)

    def getAttribute(self, obj, name):
        """
        Get object's attribute.
        If name contains '.' like 'a.b', first get attribute a and then
        try to get attribute 'b' outof 'a'.
        """
        if name.find('.') != -1:
            ls = name.split('.')
            if len(ls) > 0:
                inner = getattr(obj, ls[0])
                return self.getAttribute(inner, ls[1:][0])
            pass
        else:
            return getattr(obj, name)
        pass

    def makeIterable(self, obj):
        """
        Try to make given object iterable, if and only if object has an special attribute
        which is a tump named '__json_fields__'. Otherwise raise a TypeError.
        """
        if hasattr(obj, FIELDS_ATTRIBUTE):
            fields = getattr(obj, FIELDS_ATTRIBUTE)
            for field in fields:
                yield field, self.getAttribute(obj, field)
                pass
            pass
        else:
            logger.warn('failed to make ' + str(obj) + ' iterable, fall back to string.')
            tup = (str(obj), )
            yield iter(tup)
        pass
    pass

class SimpleJSON(object):
    """
    Simple JSON wrapper which use SimpleJSONEncoder to encode object to json.
    """
    encoder = SimpleJSONEncoder()

    @staticmethod
    def dumps(obj):
        """ Dumps given object to JSON. """
        return SimpleJSON.encoder.encode(obj)
    pass
