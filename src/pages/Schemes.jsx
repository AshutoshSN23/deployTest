import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "../styles/Dashboard.css";

const Schemes = () => {
  const [schemes, setSchemes] = useState([]);

  const translateText = async (text, lang) => {
    const response = await axios.post(
      "https://google-translate113.p.rapidapi.com/api/v1/translator/text",
      {
        from: "auto",
        to: lang,
        text: text.slice(0, 4000),
      },
      {
        headers: {
          "x-rapidapi-key": import.meta.env.VITE_XRAPID_API_KEY,
          "x-rapidapi-host": "google-translate113.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.trans;
  };

  useEffect(() => {
    const fetchSchemes = async () => {
      const baseURL =
        import.meta.env.NODE_ENV
          ? 'https://deploytest-r5j3.onrender.com'
          : 'http://localhost:5000';
  
      try {
        const resp = await axios.get(`${baseURL}/getSchemes`);
        console.log("RESPONSE: ", resp);
        
        if (Array.isArray(resp.data)) {
          setSchemes(resp.data);
        } else {
          console.warn("Expected array but got:", resp.data);
          setSchemes([]); // fallback to empty array
        }
      } catch (err) {
        console.error("Failed to fetch schemes:", err);
        setSchemes([]); // ensure fallback to array
      }
    };
  
    fetchSchemes();
  }, []);
  
  

  const handleLanguageChange = async (index, lang) => {
    const scheme = schemes[index];
    const translatedName = await translateText(scheme.name, lang);
    const translatedDescription = await translateText(scheme.description, lang);
    const updatedSchemes = [...schemes];
    updatedSchemes[index] = {
      ...scheme,
      name: translatedName,
      description: translatedDescription,
    };
    setSchemes(updatedSchemes);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <style>{`
          .title {
            text-align: center;
            color: #fff;
            font-size: 2.5rem;
            margin-bottom: 40px;
            position: relative;
          }

          .title::after {
            content: '';
            display: block;
            width: 60px;
            height: 4px;
            background-color: #48BB78;
            margin: 10px auto 0;
            border-radius: 2px;
          }

          .schemes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
          }

          .scheme-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 24px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 6px 15px rgba(0,0,0,0.2);
            color: white;
          }

          .scheme-name {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
          }

          .scheme-description {
            font-size: 15px;
            margin-bottom: 20px;
            line-height: 1.5;
          }

          .scheme-link {
            text-decoration: none;
            background-color: #38A169;
            color: white;
            padding: 10px 14px;
            border-radius: 6px;
            align-self: flex-start;
            font-weight: bold;
            transition: background-color 0.3s ease, transform 0.3s ease;
          }

          .scheme-link:hover {
            background-color: #2f855a;
            transform: scale(1.05);
          }

          select {
            padding: 8px;
            font-size: 16px;
            margin-bottom: 10px;
            border-radius: 6px;
            border: none;
            background: rgba(255,255,255,0.2);
            color: white;
            backdrop-filter: blur(4px);
            transition: background-color 0.3s ease;
          }

          select:hover {
            background-color: rgba(0, 0, 0, 0.6); /* black on hover */
          }

          @media (max-width: 600px) {
            .title {
              font-size: 1.8rem;
            }
          }
        `}</style>

        <h1 className="title">Government Schemes for Women</h1>

        <div className="schemes-grid">
          {schemes.map((scheme, index) => (
            scheme.name && scheme.description && scheme.link ? (
              <div key={index} className="scheme-card">
                <h3 className="scheme-name">{scheme.name}</h3>
                <p className="scheme-description">{scheme.description}</p>
                <div style={{display:'flex', minHeight:'fit-content', height:'4rem', justifyContent:'space-between'}}>
                  <select  style={{ verticalAlign: 'middle', height:'3rem' }} onChange={(e) => handleLanguageChange(index, e.target.value)}>
                    <option value="en">English</option>
                    <option value="kn">Kannada</option>
                    <option value="mr">Marathi</option>
                    <option value="ml">Malayalam</option>
                  </select>
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scheme-link"
                    style={{height:'3rem'}}
                  >
                    View Scheme
                  </a>
                </div>
              </div>
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schemes;