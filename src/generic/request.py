# -*-coding:utf-8 -*-
# 
# Copyright (C) 2012-2015 LuoHa TECH Co., Ltd. All rights reserved.
# Created on 2015-12-06, by rory
# 
# 

__author__ = 'rory'


import json

import requests
from tornado.log import access_log as log
from tornado.log import enable_pretty_logging

DEFAULT_HOST = 'http://192.168.1.199'
DEFAULT_PORT = '4201'


class RequestMixin(object):

    allows_methods = ['get', 'post']

    def __init__(self, url, host='', method='get', params=None, data=None):
        self.host = host or DEFAULT_HOST
        self.port = host or DEFAULT_PORT
        self.url = url
        self.method = method
        self.params = params
        self.data = data

        # enable log
        enable_pretty_logging()

    def dispatch(self):
        method = self.method.lower()
        if method not in self.allows_methods:
            raise TypeError('Method must be get or post')
        return method

    def request(self):
        handle = getattr(requests, self.dispatch())
        try:
            result = handle('%s:%s%s' % (self.host, self.port, self.url), params=self.params, data=self.data)
            result = json.loads(result.text)
        except Exception, e:
            log.info('request the url: {} failed for this reason {}'.format(self.url, e))
            return False, None
        else:
            log.info(json.dumps(result, indent=4, ensure_ascii=False))
            return True, result
