from flask import Flask, render_template, jsonify, request

app = Flask(__name__)


# ============================================================
# PURBABHASH V6 - FLOOD MANAGEMENT SYSTEM
# ============================================================


# -------------------------
# MAIN DASHBOARD
# -------------------------
@app.route("/")
def dashboard():
    return render_template("index.html")


# -------------------------
# FLOOD PREDICTION API
# -------------------------
@app.route("/api/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        rainfall = float(data.get("rainfall", 0))
        river_level = float(data.get("river_level", 0))
        water_rise = float(data.get("water_rise", 0))
        soil_moisture = float(data.get("soil_moisture", 0))

        # =====================================================
        # DEMONSTRATION FLOOD-RISK ENGINE
        # =====================================================

        risk_score = 0

        # Rainfall
        if rainfall >= 100:
            risk_score += 30
        elif rainfall >= 50:
            risk_score += 20
        else:
            risk_score += 10

        # River level
        if river_level >= 5:
            risk_score += 30
        elif river_level >= 3:
            risk_score += 20
        else:
            risk_score += 10

        # Water-level rise
        if water_rise >= 1:
            risk_score += 25
        elif water_rise >= 0.5:
            risk_score += 15
        else:
            risk_score += 5

        # Soil moisture
        if soil_moisture >= 70:
            risk_score += 15
        elif soil_moisture >= 40:
            risk_score += 10
        else:
            risk_score += 5

        # =====================================================
        # RISK CLASSIFICATION
        # =====================================================

        if risk_score >= 80:

            risk = "HIGH"

            message = (
                "High flood risk detected. "
                "Immediate preparedness is recommended."
            )

            critical = 1
            high = 1
            moderate = 0

        elif risk_score >= 55:

            risk = "MODERATE"

            message = (
                "Moderate flood risk detected. "
                "Continue monitoring environmental conditions."
            )

            critical = 0
            high = 1
            moderate = 1

        else:

            risk = "LOW"

            message = (
                "Low flood risk detected. "
                "Current conditions are relatively stable."
            )

            critical = 0
            high = 0
            moderate = 0

        # =====================================================
        # RESPONSE
        # =====================================================

        return jsonify({

            "status": "success",

            "summary": {
                "highest_risk": risk,
                "critical": critical,
                "high": high,
                "moderate": moderate
            },

            "risk_score": risk_score,

            "message": message,

            "data": {
                "rainfall": rainfall,
                "river_level": river_level,
                "water_rise": water_rise,
                "soil_moisture": soil_moisture
            }

        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "error": str(e)
        }), 400


# -------------------------
# FLOOD PREDICTION PAGE
# -------------------------
@app.route("/flood-prediction")
def flood_prediction():

    return jsonify({
        "status": "success",
        "message": "Flood prediction module is running."
    })


# -------------------------
# RISK MAP
# -------------------------
@app.route("/risk-map")
def risk_map():

    return jsonify({

        "status": "success",

        "message": "Risk map module is running.",

        "high_risk_zones": [
            "Kolkata",
            "Howrah",
            "Hooghly"
        ]

    })


# -------------------------
# SYSTEM STATUS
# -------------------------
@app.route("/api/status")
def system_status():

    return jsonify({

        "system": "PURBABHASH",
        "version": "6.0",
        "status": "online"

    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 60)
    print("              PURBABHASH VERSION 6")
    print("          FLOOD MANAGEMENT SYSTEM")
    print("=" * 60)
    print()
    print("Server running at:")
    print("http://127.0.0.1:5000")
    print()
    print("Press CTRL+C to stop the server.")
    print()

    app.run(debug=True)