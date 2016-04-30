# Map ##########################################################################

## JSON

```JavaScript
{
	"label": "Some human-friendly name",
	"entrances": {
		"start": {
			"posX": 250,
			"posY": 50,
			"direction": "down"
		},
		"center": {
			"posX": 300,
			"posY": 178,
			"direction": "up"
		}
	},
	"entities": [
		{
			"name": "tree",
			"posX": 150,
			"posY": 100,
			"posZ": "over",
			"view": "master",
			"frame": 0
		},
		{
			"name": "test",
			"posX": 150,
			"posY": 300,
			"posZ": "under",
			"view": "wanky",
			"frame": 3
		},
		{
			"name": "tree",
			"label": "Overrided entity label",
			"posX": 220,
			"posY": 100,
			"posZ": "over",
			"view": "master",
			"frame": 1,
			"rotate": 0.1,
			"enableAutoPosZ": false,
			"enableCollisions": false,
			"flipImageX": true,
			"flipImageY": true,
			"flipCollisionsX": true,
			"flipCollisionsY": true
		}
	]
}
```
