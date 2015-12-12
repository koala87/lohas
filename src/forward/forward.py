#!/usr/bin/env python2.7
# -*-coding:utf-8 -*-
__author__ = 'yin'

"""
"""
import os
import sys
import logging
import json

import tornado.iostream
import tornado.ioloop
import requests

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(ROOT, '../generic'))
from business import Business
from request import RequestMixin

# packet header length between route and business  BUSINESS_HEADER_LENGTH = 56
# packet header length between app/box/erp/init and business  CLIENT_HEADER_LENGTH = 24


CALL_DB_PORT = 4201


def init_log(fname, debug):
    logging.basicConfig(
        level=logging.DEBUG,
        format='[%(asctime)s - %(process)-6d - %(threadName)-10s - %(levelname)-8s] %(message)s',
        datefmt='%a, %d %b %Y %H:%M:%S',
        filename=fname,
        filemode='w')

    sh = logging.StreamHandler()
    if debug:
        sh.setLevel(logging.DEBUG)
    else:
        sh.setLevel(logging.INFO)
    formatter = logging.Formatter('%(levelname)-8s %(message)s')
    sh.setFormatter(formatter)
    logging.getLogger('').addHandler(sh)


def get_default_log():
    """return default log name"""
    import os

    name = os.path.basename(sys.argv[0])
    pos = name.rfind('.')
    if pos != -1:
        name = name[:pos]

    name = name.split("/")[-1]

    root_path = os.path.dirname(os.path.abspath(__file__))
    root_path = os.path.abspath(os.path.join(root_path, '../../Log/%s.log' % name))

    return root_path


def register_options():
    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option("-i", "--host", dest="host",
                      default="192.168.1.199", help="specify host, default is 192.168.1.199")
    parser.add_option("-p", "--port", dest="port",
                      type="int",
                      default=6666, help="specify port, default is 6666")
    parser.add_option("-n", "--num", dest="num",
                      type="int",
                      default=1, help="specify threads num, default is 10")
    parser.add_option("-l", "--log", dest="log",
                      default=get_default_log(), help="specify log name")
    parser.add_option("-d", "--debug", dest="debug",
                      action='store_true',
                      default=False, help="enable debug")

    (options, args) = parser.parse_args()
    return options


def analysis_json(js_str):
    ret_res_info = {}
    items = js_str["result"]["items"]
    for item in items:
        if item.get("name") == "node_list":
            node_lists = item.get("value")
            nodes = json.loads(node_lists)
            res = nodes["node_list"]
            ret_res_info["id"] = res[0].get("id")
            ret_res_info["infoserver"] = res[0].get("url")

        if item.get("name") == "ip":
            ret_res_info["server"] = "http://" +  item.get("value")

    return ret_res_info


class ForWard(Business):

    def __init__(self, ip, port, db_ip="localhost", db_port=CALL_DB_PORT):
        self.ip = ip
        self.port = port
        self.db_ip = db_ip
        self.db_port = db_port
        self._type = -1
        self._status = -1
        self._error = ''

        Business.__init__(self, 'forward', ip, port)

    type_map = {
        'app': 1,
        'box': 2,
        'erp': 3,
        'init': 4,
    }

    """process route data
    """
    def process(self):
        if 11 == self._request:
            self._device_id = self._device
            self.send_packet_back(body=self._body)
        elif 10007 == self._request:
            """ Scan a QR Code info
            """
            try:
                js = RequestMixin('/box/info/by/ip/', method='get', data={'ip': self._ip}).request()
                ver_code = js["result"]["vercode"]
                ret_val = {}
                ret_val["appServerUrl"] = ""
                ret_val["result"] = {"code": ver_code, "port": 3050}
                ret_val["status"] = 0
                body1 = json.dumps(ret_val)
                self._length = len(body1)
                print " ret json: %s   ret val %s: ", js, ret_val

                self.send_packet_back(body=body1)
            except Exception, e:
                logging.debug(e)

        elif 40001 == self._request:
            pass

        elif 90001 == self._request:
            """ app send server number 90001
                server send box number 900012
            """
            to_uid = ''
            try:
                body_json = json.loads(self._body)
                to_uid = body_json.get("touid")
                self._type = int(body_json.get("type"))
                self._device_type = self.type_map["box"]

                js1 = RequestMixin('/box/info/by/vercode/', method='get', data={'vercode': to_uid}).request()
                logging.debug("js  **** %s" % js1)
                self._device_id = js1["result"]["boxid"]
                self._device = self._device_id
                self._request = 90012

                send_body = {
                    "type": self._type,
                    "message": body_json.get("message"),
                    "fromuid": to_uid
                }
                self.send_packet_back(body=json.dumps(send_body))
                self._status = 0
            except Exception, e:
                error = e
                logging.debug(e)
                self._status = 1

            """" return app  """
            self._device_type = self.type_map["app"]
            self._request = 90001
            self._device_id = self._device

            #ret_app = {"status": self._status, "type": self._type, "uid": to_uid}
            #if self._status != 0:
            #    ret_app["error"] = error
            # self.send_packet_back(body=json.dumps(ret_app))

        elif 90005 == self._request:
            """ app -> box """
            try:
                body1 = self._body
                body_json = json.loads(body1)
                to_uid = body_json["touid"]

                self._device_type = self.type_map["box"]
                re5 = requests.get(self._url + "vercode/", params={'vercode': to_uid})
                js = re5.json()

                self._device_id = js["result"]["boxid"]
                self._device = self._device_id
                self._request = 90012

                self.send_packet_back(body=body1)
            except Exception, e:
                logging.debug(e)
        elif 90002 == self._request:
            """box -> app. send msg of switch video"""
            self._device_type = self.type_map["app"]

        elif 90003 == self._request:
            """ app -> app  || box -> apps """
            self.fun90003()
        else:
            self.send_packet_back(body=self._body)

    """send data to route
    """

    def send_packet_back(self, body="error"):
        self.send(body)

    """
    """
    def fun90002(self, to_uid, message_app, type_app):

        self._device_type = self.type_map["app"]
        self._request = 90011

        js = requests.get(self._url + "vercode/", params={'vercode': to_uid})
        box_id = js["result"]["boxid"]
        self._device_id = to_uid
        self._device = to_uid
        ret_value = {
            "fromuid": box_id,
            "message": message_app,
            "type": type_app
        }

        body_js = json.dumps(ret_value)
        self._length = len(body_js)
        self.send_packet_back(body_js)

    def fun90003(self):

        if self._device_type == self.type_map["app"]:
            """ app request res url. app to app"""
            self._device_type = self.type_map["app"]

            ret_dic = {}
            try:
                js = RequestMixin('/config/resource/', method='get', data={'names': "node_list,ip"}).request()
                res_info = analysis_json(js)
                logging.debug("ret_dic %s" % res_info)

                status = 0
                if not res_info:
                    status = 1

                res_info['status'] = status
                js_ret = json.dumps(res_info)
                self._length = len(js_ret)
                self.send_packet_back(body=js_ret)
            except Exception, e:
                ret_dic["status"] = 1
                ret_dic["error"] = e
                logging.debug("exception: %s", e)

        elif self._device_type == self.type_map["box"]:
            """ send apps. box to app  """
            js = json.loads(self._body)

            t_uid_s = [x for x in js.get("touids")]
            message = js.get("message")
            type_box = js.get("type")
            for to_uid in t_uid_s:
                self.fun90002(to_uid=to_uid, message_app=message, type_app=type_box)


    def error_requery(self):
        pass

    def on_close(self):
        Business.on_close(self)

if __name__ == '__main__':

    opts = register_options()
    init_log(opts.log, opts.debug)
    logging.info('start %d threads to server %s:%d ...' % (opts.num, opts.host, opts.port))

    for i in xrange(opts.num):
        fw = ForWard(opts.host, opts.port)

    tornado.ioloop.IOLoop.current().start()

    logging.info('stop ...')
