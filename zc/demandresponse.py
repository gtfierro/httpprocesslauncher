from smap.services.zonecontroller import ZoneController

class DemandResponse(ZoneController):
	def setup(self, opts):
		ZoneController.setup(self, opts)
		self.add_timeseries('/temp_heat','F',data_type='double')
		self.add_timeseries('/temp_cool','F',data_type='double')
		self.add_timeseries('/outlet2','On/Off',data_type='double')
		self.add_timeseries('/outlet3','On/Off',data_type='double')
		self.add_timeseries('/outlet4','On/Off',data_type='double')
		self.add_timeseries('/outlet5','On/Off',data_type='double')
		self.add_timeseries('/outlet6','On/Off',data_type='double')
		self.add_timeseries('/outlet7','On/Off',data_type='double')
		self.add_timeseries('/old_temp_heat','F',data_type='double')
		self.add_timeseries('/old_temp_cool','F',data_type='double')
		self.wattlimit = int(opts.get('wattlimit',50))
		self.turnoff = opts.get('turnoff')
		self.old_temp_heat = None
		self.old_temp_cool = None
		self.add_callback('old_temp_heat', self.store_old_heat, opts.get('subscribe/temp_heat'))
		self.add_callback('old_temp_cool', self.store_old_cool, opts.get('subscribe/temp_cool'))
		self.decisions = {
				'temp_heat': float(opts.get('new_heat')),
				'temp_cool': float(opts.get('new_cool')),
				'outlet2': None,
				'outlet3': None,
				'outlet4': None,
				'outlet5': None,
				'outlet6': None,
				'outlet7': None,
				}

	def store_old_heat(self, point, uuids, data):
		if self.old_temp_heat is None:
			self.old_temp_heat = data[-1][-1][1]

	def store_old_cool(self, point, uuids, data):
		if self.old_temp_cool is None:
			self.old_temp_cool = data[-1][-1][1]

	def stop(self):
		self.add('/temp_heat', self.old_temp_heat)
		self.add('/temp_cool', self.old_temp_cool)
			
	def step(self):
		print 'points',self.points
		if self.points['demand'] > self.wattlimit:
			print '\n\nTURN OFF\n\n'
			for outlet in self.turnoff:
				self.decisions[outlet] = 0.0
		for outlet,decision in self.decisions.iteritems():
			print outlet, decision
			if decision is not None:
				self.add('/'+outlet, decision)
		
