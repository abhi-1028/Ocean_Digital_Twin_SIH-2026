# Mock Argo float data for OceanTwin


FLOATS = {
    "ARGO_001": {
        "id": "ARGO_001",
        "latitude": 14.2,
        "longitude": 88.3,
        "date": "2026-01-15",

        "depth": [
            0,
            50,
            100,
            200,
            300,
            500,
            750,
            1000
        ],

        "temperature": [
            28.436,
            27.218,
            27.282,
            24.803,
            23.542,
            19.525,
            15.365,
            10.269
        ],

        "salinity": [
            34.236,
            34.320,
            34.318,
            34.478,
            34.547,
            34.765,
            34.993,
            35.353
        ]
    },

    "ARGO_002": {
        "id": "ARGO_002",
        "latitude": 16.8,
        "longitude": 84.7,
        "date": "2026-01-15",

        "depth": [
            0,
            50,
            100,
            200,
            300,
            500,
            750,
            1000
        ],

        "temperature": [
            27.9,
            27.2,
            26.8,
            24.5,
            22.9,
            19.1,
            14.8,
            9.9
        ],

        "salinity": [
            34.1,
            34.3,
            34.5,
            34.7,
            34.9,
            35.0,
            35.2,
            35.4
        ]
    },

    "ARGO_003": {
        "id": "ARGO_003",
        "latitude": 12.5,
        "longitude": 91.2,
        "date": "2026-01-15",

        "depth": [
            0,
            50,
            100,
            200,
            300,
            500,
            750,
            1000
        ],

        "temperature": [
            28.7,
            27.9,
            27.1,
            24.7,
            23.1,
            19.7,
            15.1,
            10.3
        ],

        "salinity": [
            34.2,
            34.4,
            34.6,
            34.8,
            34.9,
            35.1,
            35.3,
            35.5
        ]
    }
}


def get_floats():
    """
    Return a summary of all available Argo floats.
    """

    return [
        {
            "id": float_data["id"],
            "latitude": float_data["latitude"],
            "longitude": float_data["longitude"],
            "date": float_data["date"]
        }
        for float_data in FLOATS.values()
    ]


def get_float_profile(float_id: str):
    """
    Return the complete profile for one Argo float.
    """

    if float_id not in FLOATS:
        raise FileNotFoundError(
            f"Float '{float_id}' not found"
        )

    return FLOATS[float_id]


def get_float(float_id: str):
    """
    Return one complete Argo float.

    This function is used internally by
    comparison_service.py.
    """

    if float_id not in FLOATS:
        raise FileNotFoundError(
            f"Float '{float_id}' not found"
        )

    return FLOATS[float_id]