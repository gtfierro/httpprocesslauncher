from smap.services.zonecontroller import ZoneController

class PassThrough(ZoneController):
    def setup(self, opts):
        ZoneController.setup(self, opts)
        self.add_timeseries('/temp_heat','F',data_type='double')
        self.add_timeseries('/temp_cool','F',data_type='double')
