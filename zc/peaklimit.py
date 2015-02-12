from smap.services.zonecontroller import ZoneController

class PeakLimit(ZoneController):
	def setup(self, opts):
		ZoneController.setup(self, opts)
		self.add_timeseries('/outlet2','On/Off',data_type='double')
		self.add_timeseries('/outlet3','On/Off',data_type='double')
		self.add_timeseries('/outlet4','On/Off',data_type='double')
		self.add_timeseries('/outlet5','On/Off',data_type='double')
		self.add_timeseries('/outlet6','On/Off',data_type='double')
		self.wattlimit = int(opts.get('wattlimit',50))
		self.decisions = {
				'outlet2': None,
				'outlet3': None,
				'outlet4': None,
				'outlet5': None,
				'outlet6': None,
				}

	def step(self):
		print 'points',self.points
		if self.points['demand'] > self.wattlimit:
			print '\n\nTURN OFF\n\n'
			self.decisions['outlet2'] = 0.0
			self.decisions['outlet5'] = 0.0
			self.decisions['outlet6'] = 0.0
		for outlet,decision in self.decisions.iteritems():
			print outlet, decision
			if decision is not None:
				self.add('/'+outlet, decision)
		
