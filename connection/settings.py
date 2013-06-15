
SESSION = 'connection.bosh.BoshSession' # connect manager, 'websocket' or 'bosh'

SESSION_OPTIONS = {
    'wait': 60, # default session wait time.
    'hold': 1, # default connection manager requests max hold.
    'polling': 30, # default polling minmimum poll sequence, 30 seconds.
    'lang': 'en',
    'ver': '0.1',
    'charsets': 'UTF-8',
    'inactivity': 120,
}

ENCODING = 'utf8'
