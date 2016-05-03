# Entity #######################################################################

## JSON

```JavaScript
{
	"label": "Some human-friendly name",
	"views": {
		"master": [
			{
				"cropX": 0,
				"cropY": 0,
				"cropWidth": 60,
				"cropHeight": 80,
				"width": 60,
				"height": 120,
				"centerX": 32,
				"centerY": 85,
				"collisions": [
					{
						"posX": 23,
						"posY": 83,
						"width": 20,
						"height": 13
					},
					{
						"posX": 1,
						"posY": 2,
						"width": 3,
						"height": 4
					},
					{
						"posX": 10,
						"posY": 10,
						"width": 20,
						"height": 20
					}
				]
			},
			{
				"cropX": 64,
				"cropY": 0,
				"cropWidth": 64,
				"cropHeight": 96,
				"width": 10,
				"height": 456,
				"centerX": 32,
				"centerY": 233,
				"collisions": [
					{
						"posX": 12,
						"posY": 12,
						"width": 33,
						"height": 8
					}
				]
			}
		],
		"boopyDoopy": [
			{
				"cropX": 0,
				"cropY": 0,
				"cropWidth": 64,
				"cropHeight": 96,
				"width": 8,
				"height": 8,
				"centerX": 2,
				"centerY": 4
			}
		]
	},
	"animations": [
		{
			"type": "auto",
			"script": [
				"echo Some text",
				"sleep 500",
				"frame boopyDoopy 0",
				"sleep 200",
				"frame boopyDoopy 1",
				"goto 0"
			]
		},
		{
			"type": "manual",
			"script": [
				"sleep 200",
				"frame master 1"
			]
		}
	]
}
```
