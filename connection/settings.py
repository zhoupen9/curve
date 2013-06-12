
CONNECTION_MANAGER = 'connection.bosh.BoshManager' # connect manager, 'websocket' or 'bosh'

SESSION = {
    'wait': 60, # default session wait time.
    'hold': 1, # default connection manager requests max hold.
    'polling': False, # by default, connection manager does not consider client will perform pure polling
    'lang': 'en',
    'ver': '0.1',
    'charset': 'UTF-8',
}
    
