
# from django.test import TestCase
from utils import SimpleJSON

class Bar(object):
    __json_fields__ = ('value', )
    def __init__(self, value):
        self.value = value
        pass
    pass

class Foo(object):
    __json_fields__ = ('bar.value', )
    def __init__(self):
        self.bar = Bar(1)
        pass
    pass

# class TestSimpleJSON(TestCase):
#     def test(self):
#         foo = Foo()
#         SimpleJSON.dumps(foo)
#         pass
#     pass

if __name__ == '__main__':
    foo = Foo()
    print SimpleJSON.dumps(foo)
    
