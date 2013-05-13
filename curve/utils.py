
def checkNull(value, name=None):
    """ Check if given value if null, if so, a value error will raise. """
    if value is None:
        raise ValueError(name is None and "Given value" or name, " is null.")
    pass

def checkEmpty(value, name=None):
    """ check if given value if null or is empty, if so a value rror will raise. """ 
    if checkNull(value, name):
        if type(value) is str and value == "":
            raise ValueError(name is None and "Given value" or name, " is empty.")
    pass


