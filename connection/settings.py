
SESSION = 'connection.bosh.BoshSession' # connect manager, 'websocket' or 'bosh'

SESSION_OPTIONS = {
    'wait': 10, # default session wait time.
    'hold': 1, # default connection manager requests max hold.
    'polling': 5, # default polling minmimum poll sequence, 5 seconds.
    'lang': 'en',
    'ver': '0.1',
    'charsets': 'UTF-8',
    'inactivity': 60,
}

ENCODING = 'utf8'
