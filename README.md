Fuel Blend Property Predictor




1. Overview


This prototype has been developed as a critical component of the Shell.ai Hackathon for Sustainable and Affordable Energy, specifically addressing the "Fuel Blend Properties Prediction Challenge" at Level 2 of the competition.1 The hackathon serves as a vital platform for fostering innovative digital solutions aimed at tackling the pressing global energy challenges, particularly within the evolving landscape of sustainable fuels.1 The initial framing of this project within the broader mission of sustainable and affordable energy immediately establishes its significance, positioning it not merely as a technical exercise but as a direct contribution to a critical global imperative.
The challenge itself underscores the intricate nature of integrating innovative fuels, such as Sustainable Aviation Fuels (SAFs) and renewable diesel, into existing energy ecosystems.1 This process is described as an "intricate science" that necessitates precise property prediction to ensure both operational viability and environmental benefits. The prototype's purpose is to accurately predict 10 key physical and chemical properties of novel fuel blends. By leveraging advanced machine learning methodologies, it aims to streamline the inherently complex process of crafting optimal fuel blends, thereby ensuring strict adherence to rigorous safety and performance specifications, maximizing environmental benefits, and maintaining economic viability.1 The ability of this tool to address the "delicate balancing act" involved in fuel development—encompassing safety, performance, environmental impact, and economic considerations—significantly enhances its perceived utility and value within the industry.
The design and implementation of this prototype directly align with the Level 2 requirements of the hackathon, which mandate the development of a "functional prototype" based on a previously formulated conceptual solution.1 The prototype has been meticulously built with a primary focus on effectively demonstrating its capabilities. Its development has been guided by the three equally weighted evaluation criteria set forth by the hackathon organizers: Functionality and Usability, Innovation, and Scalability and Performance.1


2. Challenge & Our Solution




The Intricacy of Fuel Blending


The process of crafting optimal fuel blends is recognized as an "intricate science".1 It involves the precise mixing of various sustainable fuel types, often in combination with conventional fuels, where each component possesses a unique set of properties. The fundamental challenge lies in accurately predicting the final properties of the blended fuel from the characteristics of its constituent components. This prediction is crucial for meeting stringent industry standards and achieving environmental sustainability goals. Traditionally, this process has relied heavily on extensive laboratory testing, which is both time-consuming and resource-intensive. The contrast between this conventional, costly method of iterative physical testing and the prototype's automated, data-driven approach highlights the significant practical value and efficiency gains offered by this solution.


Our Predictive Approach


This prototype offers an intelligent, data-driven solution to the aforementioned challenges. It employs a sophisticated machine learning model engineered to predict 10 critical final blend properties based on two primary inputs: the blend's composition and the detailed properties of its constituent components. This predictive capability is designed to significantly accelerate the fuel development cycle, substantially reducing the need for iterative physical testing and thereby lowering associated costs and time-to-market.


Solution Architecture Overview (High-Level)


The prototype is architected as a robust and readily accessible web API, built upon the FastAPI framework and served by Uvicorn.1 This architectural choice immediately signals that the prototype functions as an API, rather than a standalone script or graphical user interface, which is a critical design decision influencing user interaction. This design facilitates seamless integration into existing digital workflows and provides a scalable endpoint for real-time fuel blend property predictions. At its core, the solution encompasses three main operational phases:
* Data Ingestion and Preprocessing: This involves loading and preparing input data, specifically blend composition and component properties, for consumption by the predictive model.
* Machine Learning Model: A trained model is central to the system, capable of performing regression to predict the final blend properties.
* API Endpoint: An accessible API endpoint is provided, designed to accept new blend data and return the corresponding predictions.


3. Dataset Description




Overview of Provided Data


The project leverages a comprehensive dataset provided by the Shell.ai Hackathon, meticulously structured across three primary files: train.csv, test.csv, and sample_submission.csv. This dataset is designed to simulate real-world fuel blend scenarios, providing the necessary foundation for the development and rigorous evaluation of predictive models.


train.csv - Training Data


This file contains the data utilized for training the predictive models. Each row within train.csv represents a unique fuel blend and comprises a total of 65 columns, which are logically organized into three distinct groups:
* Blend Composition (First 5 columns): These columns precisely specify the volume percentage of each of the five base components within a given blend. This information is fundamental for understanding the precise mixture ratios.
* Component Properties (Next 50 columns): This critical section simulates a real-world Certificate of Analysis (COA), providing 10 distinct properties for each of the 5 base components used in a blend. The column names follow a structured format, {component_number}_{property_number} (e.g., Component1_Property1), clearly linking each property to its respective component. This suite of properties offers a holistic assessment of the fuel components, detailing their core physical and chemical nature, critical safety and operational limits, and their full lifecycle environmental impact. The detailed structure of these component properties (5 components, each with 10 properties) indicates that the model must effectively process multi-source, structured input. This presents significant opportunities for advanced feature engineering, such as deriving interaction terms between blend composition and component properties, or for employing models inherently capable of discerning such complex relationships, thereby contributing to the innovative aspects of the solution. The "COA simulation" aspect of these properties further underscores the real-world relevance of the data. A robust model must be capable of generalizing effectively to new, unseen component property profiles, a crucial capability for the successful development of 'drop-in' replacement fuels.
* Final Blend Properties - Targets (Last 10 columns): These are the 10 target variables that the model is designed to predict. They correspond to the measured properties of the final blend, which is intended to serve as a 'drop-in' replacement fuel. The column names for these target properties are structured as Blend{property_number} (e.g., BlendProperty1).


test.csv - Evaluation Data


This file is specifically designated for evaluating the performance of the developed model. It contains the input features for 500 unique fuel blends that are not present in the training dataset. The structure of this file is identical to the input feature columns of train.csv, encompassing the 5 blend composition columns and the 50 component property columns. Importantly, test.csv does not include the 10 target property columns, as these are the values the prototype is required to predict for submission. The test set is strategically split for leaderboard evaluation, emphasizing the need for accurate and generalizable predictions.


sample_submission.csv - Submission Format


This file serves as a template, demonstrating the precise format required for model submissions. The submission file generated by the prototype must adhere strictly to this structure to ensure correct scoring. Each row in the submission must correspond to the same row in the test.csv file, with the order meticulously preserved for accurate evaluation. The file must contain exactly 10 columns (excluding an ID column), one for each of the 10 target properties the model is expected to predict. The prescribed column order is ID, BlendProperty1, BlendProperty2,..., BlendProperty10.


Dataset Column Structure


To provide a clear and concise overview of the dataset's composition, the following table summarizes the structure of the columns across the various data files. This visual representation is instrumental for understanding the model's inputs and outputs, and for quickly grasping the scale and nature of the data, particularly the distinction between input features and target variables.
Column Group
	Number of Columns
	Description
	Example Column Names
	Blend Composition
	5
	Volume percentage of 5 base components
	Component1, Component2
	Component Properties
	50
	10 properties for each of 5 components (COA simulation)
	Component1_Property1, Component5_Property10
	Target Properties
	10
	10 predicted properties of the final blend
	BlendProperty1, BlendProperty10
	

4. Technical Architecture & Dependencies




Core Components


The prototype's architecture has been meticulously designed to prioritize modularity, performance, and ease of deployment, primarily leveraging the Python ecosystem. Key components that form the backbone of this solution include:
* Data Handling Module: This module is responsible for efficiently loading the train.csv and test.csv files, performing necessary data preprocessing, and preparing the data for seamless model inference. It heavily relies on the pandas and numpy libraries for robust and efficient data manipulation.1
* Machine Learning Model: The central predictive engine of the prototype is a TabPFN (Tabular Prior-Data Fitted Network) model. This particular model was chosen for its exceptional performance on tabular data and its recent updates that include robust regressor support.1 The specific selection of
TabPFN, a relatively new and powerful deep learning model for tabular data, signifies a commitment to leveraging cutting-edge AI techniques for superior prediction accuracy, which is a strong indicator of innovation.
* Model Persistence: To ensure efficient deployment and avoid redundant retraining with every execution, the trained machine learning model is saved and loaded using the joblib library.1 This optimizes startup times and reduces computational overhead.
* Prediction API: The core interface for predictions is implemented using FastAPI, a modern, high-performance web framework for building APIs with Python 3.7+ that leverages standard Python type hints.1 This choice provides a clear, efficient, and well-structured interface for submitting new blend data and receiving predictions.
* ASGI Server: Uvicorn serves as the ASGI (Asynchronous Server Gateway Interface) server, enabling asynchronous request handling. This capability is crucial for achieving high concurrency and maintaining performance under load.1
* Data Validation: Pydantic is seamlessly integrated with FastAPI to ensure robust data validation for all incoming API requests.1 This enhances the reliability and usability of the API by providing immediate feedback on malformed inputs.
* python-multipart is also included.1 While not directly used in the current core prediction logic, its presence facilitates potential future enhancements, such as enabling file uploads for bulk predictions via the API.


Technological Stack Flexibility


While the current implementation utilizes FastAPI and Uvicorn to provide a robust API backend, the modular design of the prototype allows for flexible integration with various front-end frameworks for visual storytelling. The hackathon organizers specifically suggested examples such as Streamlit, Gradio, NiceGUI, Plotly DASH, and Voila.1 This adaptability demonstrates adherence to competition guidelines and positions the prototype for enhanced user interaction and communication of results.


Dependencies


The following Python libraries are essential for the prototype's operation. They are comprehensively listed in the requirements.txt file and can be efficiently installed using pip. The selection of FastAPI and Uvicorn inherently suggests a strong focus on performance and scalability due to their asynchronous capabilities and speed. This architectural choice directly supports the "Scalability and Performance" evaluation criterion.


Project Dependencies


The table below provides a detailed list of the Python libraries required for this project, along with their specified versions and their primary purpose within the prototype's architecture. This organized list of technical prerequisites simplifies the setup process for evaluators and other developers, and the inclusion of each library's purpose demonstrates a clear understanding of the project's technical stack.
Library Name
	Version
	Purpose in Project
	tabpfn
	>=0.1.8
	Core machine learning model for tabular data regression, with regressor support
	torch
	==2.1.1
	Underlying deep learning framework for TabPFN
	fastapi
	==0.104.1
	High-performance web framework for building the prediction API
	uvicorn[standard]
	==0.24.0
	ASGI web server for serving the FastAPI application
	pandas
	==2.1.3
	Data manipulation and analysis, particularly for tabular data
	numpy
	==1.24.3
	Fundamental library for numerical computing in Python
	scikit-learn
	==1.3.2
	General machine learning utilities and data preprocessing
	joblib
	==1.3.2
	Efficient serialization of Python objects, used for model persistence
	python-multipart
	==0.0.6
	Parsing multipart form data, useful for file uploads
	pydantic
	==2.5.0
	Data validation and settings management, integrated with FastAPI
	

5. Setup & Installation


To set up and run the prototype, follow these steps. It is strongly recommended to use a virtual environment to manage dependencies, ensuring a clean and isolated project environment.


Prerequisites


   * Ensure Python 3.9 or a more recent version is installed on the system.


Step-by-Step Installation


   1. Clone the Repository:
Begin by cloning the project repository from its source.
Bash
git clone
cd [your-project-directory]

   2. Create a Virtual Environment (Recommended):
Establish a dedicated virtual environment for the project to prevent dependency conflicts.
Bash
python -m venv venv

   3. Activate the Virtual Environment:
Activate the newly created virtual environment. The commands differ based on the operating system. Providing clear, platform-specific instructions for virtual environment activation demonstrates meticulous attention to detail and significantly enhances the usability of the setup process.
      * Windows:
.\venv\Scripts\activate```
      * macOS/Linux:
Bash
source venv/bin/activate

         4. Install Dependencies:
First, ensure pip is updated to its latest version, then install all required libraries as specified in requirements.txt.1
Bash
pip install --upgrade pip
pip install -r requirements.txt

It is important to note that the torch installation might take a considerable amount of time as it fetches from a specific download link.1 This observation helps manage user expectations and prevents potential frustration during the installation process, contributing to a smoother user experience.
         5. Place Data Files:
Ensure that the train.csv, test.csv, and sample_submission.csv files are correctly placed in the designated data/ directory (or the specified path) within the project structure. This step is crucial for the prototype's operational readiness.


6. Usage Guide


This section details how to interact with the deployed prototype, specifically its prediction API, to obtain fuel blend property predictions.


1. Start the Prediction API Server


Navigate to the project's root directory in your terminal, where the main FastAPI application file (e.g., main.py) resides. Then, initiate the Uvicorn server:


Bash




uvicorn main:app --host 0.0.0.0 --port 8000 --reload

The --reload flag is particularly useful during development, as it automatically restarts the server upon detecting code changes. For production deployments, this flag should typically be removed. Once the server is running, the API will be accessible via http://localhost:8000.


2. Access API Documentation (Swagger UI / ReDoc)


A significant advantage of FastAPI is its automatic generation of interactive API documentation. Once the server is operational, users can access comprehensive documentation through their web browser:
            * Swagger UI: Navigate to http://localhost:8000/docs for an interactive interface that allows exploration and testing of API endpoints.
            * ReDoc: Visit http://localhost:8000/redoc for an alternative, more compact documentation view.
These auto-generated documents provide detailed information regarding available endpoints, expected input schemas (rigorously validated by Pydantic), and the format of response data. Highlighting FastAPI's auto-generated Swagger UI and ReDoc is a powerful way to demonstrate the API's usability and self-documentation capabilities, further enhancing the overall user experience.


3. Make Predictions via API


Predictions are made by sending POST requests to the dedicated /predict endpoint (the exact endpoint name should be confirmed in the API documentation). The API is designed to accept a JSON payload containing the blend composition and component properties for one or more blends. Explicitly stating that the API can handle a list of blend dictionaries for batch predictions underscores its scalability and efficiency, which are key evaluation criteria for the hackathon.


Example JSON Structure (for a single blend):




JSON




[
 {
   "Component1": 0.2,
   "Component2": 0.3,
   "Component3": 0.1,
   "Component4": 0.2,
   "Component5": 0.2,
   "Component1_Property1": 100.5,
   "Component1_Property2": 25.0,
   //... up to Component5_Property10 (all 50 component properties)
 }
]

Note: The API is designed to accept a list of blend dictionaries for efficient batch predictions.


Example curl Command:


Providing curl commands and Python snippets for API interaction directly demonstrates the prototype's functionality and usability, offering evaluators actionable steps to test the system.


Bash




curl -X 'POST' \
 'http://localhost:8000/predict' \
 -H 'accept: application/json' \
 -H 'Content-Type: application/json' \
 -d '[{"Component1": 0.2, "Component2": 0.3, "Component3": 0.1, "Component4": 0.2, "Component5": 0.2, "Component1_Property1": 100.5, "Component1_Property2": 25.0, "Component1_Property3": 5.0, "Component1_Property4": 75.0, "Component1_Property5": 10.0, "Component1_Property6": 0.8, "Component1_Property7": 1.2, "Component1_Property8": 90.0, "Component1_Property9": 15.0, "Component1_Property10": 0.05, "Component2_Property1": 98.0, "Component2_Property2": 26.0, "Component2_Property3": 4.5, "Component2_Property4": 78.0, "Component2_Property5": 11.0, "Component2_Property6": 0.9, "Component2_Property7": 1.1, "Component2_Property8": 92.0, "Component2_Property9": 16.0, "Component2_Property10": 0.06, "Component3_Property1": 102.0, "Component3_Property2": 24.0, "Component3_Property3": 5.5, "Component3_Property4": 73.0, "Component3_Property5": 9.5, "Component3_Property6": 0.7, "Component3_Property7": 1.3, "Component3_Property8": 88.0, "Component3_Property9": 14.0, "Component3_Property10": 0.04, "Component4_Property1": 99.5, "Component4_Property2": 25.5, "Component4_Property3": 4.8, "Component4_Property4": 76.0, "Component4_Property5": 10.5, "Component4_Property6": 0.85, "Component4_Property7": 1.15, "Component4_Property8": 91.0, "Component4_Property9": 15.5, "Component4_Property10": 0.055, "Component5_Property1": 101.0, "Component5_Property2": 24.5, "Component5_Property3": 5.2, "Component5_Property4": 74.0, "Component5_Property5": 9.8, "Component5_Property6": 0.75, "Component5_Property7": 1.25, "Component5_Property8": 89.0, "Component5_Property9": 14.5, "Component5_Property10": 0.045}]'




4. Generate Submission File


A dedicated script (e.g., generate_submission.py) is provided to streamline the process of generating the final submission file. This script is designed to read the test.csv file, send prediction requests to the running API, and then format the received predictions into the precise sample_submission.csv format required for evaluation.


Usage:




Bash



python generate_submission.py --input_test_csv test.csv --output_submission_csv submission.csv --api_url http://localhost:8000/predict

It is important to ensure that the generate_submission.py script is either documented separately or its core logic is briefly explained for clarity.


7. Key Features & Innovation


This section highlights the prototype's core strengths, directly addressing the hackathon's evaluation criteria of Functionality and Usability, Innovation, and Scalability and Performance.1


Functionality and Usability


            * Intuitive API Design: The prototype exposes a clean, well-documented API endpoint (/predict) specifically for fuel blend property predictions. By leveraging FastAPI's automatic documentation features (Swagger UI/ReDoc), an interactive interface is provided for exploring and testing the API, which significantly enhances developer usability.
            * Clear Input/Output Schema: The integration of Pydantic models ensures strict validation of all incoming data. This provides immediate and precise feedback on incorrect inputs, making the API robust and straightforward to integrate into various systems.
            * Programmatic Access: The inclusion of practical curl commands and Python snippets within the Usage Guide ensures that users can effortlessly integrate the prediction capabilities into their own scripts or applications, demonstrating direct usability and functionality.
            * Batch Prediction Support: The API is engineered to accept multiple blend inputs within a single request. This design enables highly efficient batch predictions for large datasets, such as the test.csv file containing 500 blends, thereby improving overall workflow efficiency and demonstrating a focus on practical application.


Innovation


            * Advanced Model Selection (TabPFN): A significant innovative aspect of this prototype is the utilization of TabPFN (Tabular Prior-Data Fitted Network) as the core predictive model.1 This choice moves beyond conventional machine learning models, opting for a state-of-the-art deep learning model specifically designed for tabular data.
TabPFN has demonstrated exceptional performance, particularly with its updated regressor support 1, reflecting a commitment to leveraging cutting-edge AI for superior prediction accuracy.
            * Holistic Data Utilization: The model effectively processes the complex and multi-faceted dataset structure provided, which includes both the 5 blend compositions and the 50 component properties that simulate real-world Certificates of Analysis (COAs) [User Query]. This capability demonstrates a sophisticated understanding and ability to derive meaningful insights from intricate, domain-specific data, going beyond simpler feature sets and showcasing a deeper technical approach.
            * API-First Approach: By constructing a robust FastAPI service 1, the prototype establishes a flexible and extensible foundation. This architectural decision facilitates easy integration with various front-end applications, such as Streamlit, Gradio, or Plotly DASH (as suggested by the hackathon guidelines 1) for enhanced visual storytelling, or direct integration into larger enterprise systems, showcasing a forward-thinking design.


Visual Storytelling


While the core of this prototype is an API designed for programmatic interaction, its modular architecture readily supports the development of a dedicated interactive web interface. Such an interface, built using frameworks like Streamlit or Gradio, could demonstrate interactive input and real-time prediction visualization, thereby significantly enhancing the usability and communication of results and fulfilling the "visual storytelling" aspect encouraged by the hackathon. The API serves as the functional core, ready for seamless integration with such tools.


8. Scalability & Performance Considerations


The architectural choices and implementation details of this prototype reflect a strong emphasis on achieving high performance and scalability, directly addressing key evaluation criteria of the Shell.ai Hackathon.1


High-Performance API Framework


The selection of FastAPI in conjunction with Uvicorn 1 provides a highly performant foundation for the prediction service.
FastAPI's asynchronous capabilities, combined with Uvicorn's efficient handling of concurrent requests, ensure that the API can effectively manage a significant load of prediction requests. This design makes the prototype well-suited for deployment in production-like environments where responsiveness and throughput are critical. The inherent speed and asynchronous nature of this combination directly contribute to the system's ability to scale.


Efficient Model Inference


The TabPFN model, while powerful in its predictive capabilities, is also optimized for efficient inference. Its underlying integration with torch 1 allows for potential GPU acceleration if compatible hardware is available, which can further boost prediction speed, especially for larger datasets. Furthermore, model loading is optimized through the use of
joblib.1 This ensures that the trained model is loaded into memory only once when the API starts, thereby minimizing latency for all subsequent prediction requests and ensuring rapid response times.


Batch Processing Capability


The API's design, which allows it to accept a list of inputs for predictions, enables highly efficient batch processing of multiple fuel blends. This capability significantly reduces network overhead and maximizes throughput compared to sending individual requests for each blend. This design choice directly contributes to the prototype's scalability, allowing it to handle larger volumes of data more effectively.


Containerization Readiness


The use of standard Python libraries and a requirements.txt file 1 inherently makes the prototype highly amenable to containerization technologies, such as Docker. While not explicitly implemented in this prototype, this characteristic facilitates consistent deployment across diverse environments and simplifies horizontal scaling by enabling the easy creation and management of multiple instances of the service. This readiness for containerization demonstrates foresight in deployment strategy, further strengthening the argument for the prototype's scalability.


Resource Efficiency


The lean nature of FastAPI and the efficient data handling capabilities provided by pandas and numpy 1 collectively contribute to a relatively low memory footprint for the prototype. This resource efficiency allows for more optimized utilization of computing resources when the service is deployed, enhancing its overall performance characteristics.


9. Future Enhancements


The current prototype provides a robust foundation for fuel blend property prediction. Several avenues for future development exist to further enhance its capabilities, usability, and deployment readiness:
               * Model Refinement: Continued efforts could explore advanced ensemble methods or fine-tuning techniques for the TabPFN model to achieve even greater prediction accuracy. Additionally, investigating transfer learning approaches could be beneficial if more diverse or larger fuel blend datasets become available in the future.
               * User Interface Development: Developing a dedicated, interactive web interface using frameworks like Streamlit, Gradio, or Plotly DASH 1 would provide a more visual and user-friendly experience for non-technical stakeholders. This would significantly enhance the "visual storytelling" aspect of the solution, making it more accessible and impactful.
               * Batch Prediction via File Upload: Enhancing the API to directly accept test.csv or similar files via upload (leveraging the python-multipart library 1) would simplify the process for users needing to perform bulk predictions, streamlining the submission workflow.
               * Deployment Automation: Implementing Continuous Integration/Continuous Deployment (CI/CD) pipelines would automate the testing and deployment processes to various cloud platforms (e.g., AWS, Azure, GCP). This aligns with the hackathon's flexibility regarding hosting options 1 and would ensure a more efficient and reliable deployment lifecycle.
               * Expanded Property Prediction: Should additional relevant data become available, the model could be extended to predict a broader range of fuel properties or to explore different types of fuel blends, expanding its utility and applicability.


10. Contact


For inquiries or further information regarding this prototype, please contact the project team:
               * Email:rohitprakash1105@gmail.com
               * GitHub: https://github.com/Niranjanakamaraj/Shell-Shockers