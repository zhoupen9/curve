# -*- coding: utf-8 -*-
import json

JSON_INTERFACE = '__json__'

class SimpleJSONEncoder(json.JSONEncoder):
    """
    A simple json encoder which helps to encode object besides json supported types.
    Given object will be encode in a dict, so json will output in format of 
    { 'foo': 'bar' }
    Non-ASCII texts will be outputed as unicode string meaning that client need
    to decode them. E.G. javascript can do that by
    JSON.parse(data)

    This simple json encoder try to encode object types not supported by default by
    call JSON_INTERFACE on object, if object not supported by default and has no 
    JSON_INTERFACE, a TypeError will raise.

    Classes implement JSON_INTERFACE must return a supported type, such as 
    int, str, dict, list, tuple.

    E.G.

    class Foo(object):
        # all json output fields, if there is only one field need to
        # be encoded to json, there must be an empty trial comma.
        def __init__(self):
            self.bar = '中文'
        pass
        def __json__(self):
            return {
                'bar': self.bar
                }
             pass
    pass
    """
    def default(self, obj):
        """ Implement own default encoding. """
        if obj is None:
            return {}
        
        try:
            iterable = iter(obj)
        except TypeError:
            iterable = self.json(obj)
            return dict(iterable)
        else:
            return dict(iterable)

        return json.JSONEncoder.default(self, obj)

    def json(self, obj):
        """
        Check if given object has JSON interface, if so, get object's json
        by call JSON_INTERFACE.
        """
        if hasattr(obj, JSON_INTERFACE):
            interface = getattr(obj, JSON_INTERFACE)
            if interface is not None and callable(interface):
                return interface()
            pass
        raise TypeError
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
