<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rocketry and Aviation Club</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            width: 100%;
            height: 100%;
            background: #0a0e27;
            color: #e0e6ff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow-x: hidden;
        }

        /* Navigation */
        nav {
            position: fixed;
            top: 0;
            width: 100%;
            padding: 1.5rem 3rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(10, 14, 39, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1000;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            letter-spacing: 3px;
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        nav ul {
            display: flex;
            gap: 2rem;
            list-style: none;
        }

        nav a {
            color: #e0e6ff;
            text-decoration: none;
            transition: color 0.3s;
            font-size: 0.95rem;
            letter-spacing: 1px;
        }

        nav a:hover {
            color: #00d4ff;
        }

        /* Hero Section with Blackhole */
        .hero {
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0a0e27;
            margin-top: -80px;
            padding-top: 80px;
        }

        .blackhole-bg {
            position: absolute;
            width: 150%;
            height: 150%;
            top: -25%;
            left: -25%;
            background: radial-gradient(
                circle at 50% 50%,
                rgba(0, 212, 255, 0.3) 0%,
                rgba(0, 153, 255, 0.2) 5%,
                rgba(0, 100, 200, 0.15) 10%,
                rgba(30, 50, 100, 0.1) 15%,
                rgba(10, 14, 39, 0) 50%
            );
            filter: blur(40px);
            animation: blackholeRotate 20s linear infinite;
        }

        @keyframes blackholeRotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        .blackhole-core {
            position: absolute;
            width: 400px;
            height: 400px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(
                circle at 30% 30%,
                rgba(0, 200, 255, 0.4) 0%,
                rgba(0, 100, 255, 0.2) 20%,
                rgba(0, 50, 150, 0.1) 40%,
                transparent 70%
            );
            box-shadow:
                0 0 100px rgba(0, 212, 255, 0.4),
                0 0 200px rgba(0, 100, 200, 0.2),
                inset 0 0 80px rgba(0, 50, 100, 0.3);
            border-radius: 50%;
            animation: pulseBlackhole 4s ease-in-out infinite;
        }

        @keyframes pulseBlackhole {
            0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                box-shadow:
                    0 0 100px rgba(0, 212, 255, 0.4),
                    0 0 200px rgba(0, 100, 200, 0.2),
                    inset 0 0 80px rgba(0, 50, 100, 0.3);
            }
            50% {
                transform: translate(-50%, -50%) scale(1.05);
                box-shadow:
                    0 0 120px rgba(0, 212, 255, 0.5),
                    0 0 240px rgba(0, 100, 200, 0.3),
                    inset 0 0 100px rgba(0, 50, 100, 0.4);
            }
        }

        .event-horizon {
            position: absolute;
            width: 300px;
            height: 300px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border: 2px solid rgba(0, 212, 255, 0.6);
            border-radius: 50%;
            background: radial-gradient(
                circle at 35% 35%,
                rgba(0, 0, 0, 0.3),
                rgba(0, 20, 50, 0.6)
            );
            box-shadow: 0 0 60px rgba(0, 212, 255, 0.3);
            animation: eventHorizonRotate 8s linear infinite reverse;
        }

        @keyframes eventHorizonRotate {
            0% {
                transform: translate(-50%, -50%) rotate(0deg);
            }
            100% {
                transform: translate(-50%, -50%) rotate(360deg);
            }
        }

        .accretion-disk {
            position: absolute;
            width: 500px;
            height: 500px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border: 3px solid transparent;
            border-top-color: rgba(0, 212, 255, 0.4);
            border-right-color: rgba(0, 150, 200, 0.3);
            border-radius: 50%;
            animation: accretionRotate 15s linear infinite;
        }

        @keyframes accretionRotate {
            0% {
                transform: translate(-50%, -50%) rotate(0deg);
            }
            100% {
                transform: translate(-50%, -50%) rotate(360deg);
            }
        }

        .stars {
            position: absolute;
            width: 100%;
            height: 100%;
            background-image:
                radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 60px 70px, #fff, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 50px 50px, #fff, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 90px 10px, #fff, rgba(0,0,0,0));
            background-size: 200px 200px;
            background-position: 0 0, 40px 60px, 130px 270px, 70px 100px, 110px 200px;
            opacity: 0.5;
            animation: twinkle 5s ease-in-out infinite;
        }

        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
        }

        .hero-content {
            position: relative;
            z-index: 10;
            text-align: center;
            animation: fadeInDown 1s ease-out;
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .hero-logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 100, 200, 0.2));
            border: 2px solid rgba(0, 212, 255, 0.5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 60px;
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-20px);
            }
        }

        .hero h1 {
            font-size: 4rem;
            font-weight: 300;
            letter-spacing: 5px;
            margin-bottom: 20px;
            text-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
            line-height: 1.2;
        }

        .hero h1 span {
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: block;
            font-weight: bold;
        }

        .hero p {
            font-size: 1.3rem;
            color: #a0a6d6;
            margin-bottom: 40px;
            letter-spacing: 2px;
        }

        .cta-button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            color: #0a0e27;
            text-decoration: none;
            border: none;
            cursor: pointer;
            font-weight: bold;
            letter-spacing: 2px;
            border-radius: 5px;
            transition: all 0.3s;
            text-transform: uppercase;
            font-size: 1rem;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }

        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 0 40px rgba(0, 212, 255, 0.6);
        }

        /* Teams Section */
        .teams {
            position: relative;
            padding: 80px 3rem;
            background: linear-gradient(180deg, #0a0e27, #0f1535);
            z-index: 20;
        }

        .section-title {
            text-align: center;
            font-size: 2.5rem;
            letter-spacing: 3px;
            margin-bottom: 60px;
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .teams-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .team-card {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(0, 100, 200, 0.05));
            border: 1px solid rgba(0, 212, 255, 0.2);
            padding: 30px;
            border-radius: 10px;
            transition: all 0.3s;
            cursor: pointer;
            backdrop-filter: blur(10px);
        }

        .team-card:hover {
            transform: translateY(-10px);
            border-color: rgba(0, 212, 255, 0.5);
            box-shadow: 0 10px 40px rgba(0, 212, 255, 0.2);
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 100, 200, 0.1));
        }

        .team-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin-bottom: 20px;
        }

        .team-card h3 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            letter-spacing: 2px;
            color: #00d4ff;
        }

        .team-members {
            list-style: none;
        }

        .team-members li {
            padding: 10px 0;
            border-bottom: 1px solid rgba(0, 212, 255, 0.1);
            font-size: 0.95rem;
            color: #a0a6d6;
            transition: color 0.3s;
        }

        .team-members li:hover {
            color: #00d4ff;
        }

        .team-members li:last-child {
            border-bottom: none;
        }

        /* Footer */
        footer {
            background: rgba(10, 14, 39, 0.95);
            border-top: 1px solid rgba(0, 212, 255, 0.2);
            padding: 40px 3rem;
            text-align: center;
            color: #a0a6d6;
            font-size: 0.9rem;
            letter-spacing: 1px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }

            .hero p {
                font-size: 1rem;
            }

            nav ul {
                gap: 1rem;
            }

            nav {
                padding: 1rem 1.5rem;
            }

            .teams {
                padding: 60px 1.5rem;
            }

            .section-title {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav>
        <div class="logo">RAC</div>
        <ul>
            <li><a href="#hero">HOME</a></li>
            <li><a href="#teams">TEAMS</a></li>
            <li><a href="#contact">CONTACT</a></li>
        </ul>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="hero">
        <div class="stars"></div>
        <div class="blackhole-bg"></div>
        <div class="accretion-disk"></div>
        <div class="event-horizon"></div>
        <div class="blackhole-core"></div>

        <div class="hero-content">
            <div class="hero-logo">🚀</div>
            <h1>ROCKETRY<span>& AVIATION CLUB</span></h1>
            <p>REACHING FOR THE STARS</p>
            <button class="cta-button">EXPLORE NOW</button>
        </div>
    </section>

    <!-- Teams Section -->
    <section class="teams" id="teams">
        <h2 class="section-title">OUR TEAMS</h2>

        <div class="teams-grid">
            <!-- Propulsion Team -->
            <div class="team-card">
                <div class="team-icon">⚡</div>
                <h3>PROPULSION</h3>
                <ul class="team-members">
                    <li>Arunya Guha</li>
                    <li>Anshul Kumar</li>
                    <li>Chinmay Choudhary</li>
                    <li>Aryan Verma</li>
                </ul>
            </div>

            <!-- Airframe & Recovery Team -->
            <div class="team-card">
                <div class="team-icon">🛰️</div>
                <h3>AIRFRAME & RECOVERY</h3>
                <ul class="team-members">
                    <li>Allu Bharath Kumar</li>
                    <li>Abhishek Dwivedi</li>
                    <li>Tejomurtula Sai Rama Krishna</li>
                </ul>
            </div>

            <!-- Avionics Team -->
            <div class="team-card">
                <div class="team-icon">🎛️</div>
                <h3>AVIONICS</h3>
                <ul class="team-members">
                    <li>Nihit Raj</li>
                    <li>Tannay Wankhade</li>
                    <li>Harsh Kumar Sing</li>
                    <li>Jayendra Singh</li>
                    <li>Adi Singh</li>
                    <li>Garvit Sharma</li>
                </ul>
            </div>

            <!-- Web Dev & Management Team -->
            <div class="team-card">
                <div class="team-icon">💻</div>
                <h3>WEB DEV & MANAGEMENT</h3>
                <ul class="team-members">
                    <li>Rhit Agravat</li>
                    <li>Samriddhi</li>
                    <li>Bhavesh Lokesh Agarwal</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer id="contact">
        <p>&copy; 2026 ROCKETRY AND AVIATION CLUB. REACHING FOR THE STARS.</p>
    </footer>
</body>
</html>
