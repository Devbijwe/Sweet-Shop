from flask import Flask, flash, redirect, render_template, request, jsonify, url_for

app = Flask(__name__)

import views