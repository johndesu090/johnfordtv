<?php 
/*
 * create shortcode with class 
*/

class FcpShortCodes {

	function __construct() {
		
	}

	public static function fcp_water_intake_calculator( $atts, $content = "" ) {
		$fcw_title = __( 'no title', 'fitness-calculators' );
		if(trim(get_option('fcw_heading'))!=false)
		{
			$fcw_title = get_option('fcw_heading');	
		}

		$fcw_calculator_type = '';
		$placeHolderHeight = '';
		$placeHolderWeight = '';
		if(trim(get_option('fcw_calculator_type'))!=false)
		{
			$fcw_calculator_type = get_option('fcw_calculator_type');	
		}

		$fcw_theme_color = '#004d99';
		if(trim(get_option('fcw_theme_color'))!=false)
		{
			$fcw_theme_color = get_option('fcw_theme_color');	
		}
		
		$html =  '<style>#fcp-water-intake-form {
				    margin: 0px;
				    padding: 0px;
				    border: solid 2px '.$fcw_theme_color.';
				    width: 100%;
				    float: left;
				}';
		if($fcw_calculator_type == 'metric') { 		
		$html .= '#fcp-water-intake-form .fcp-radio-btn {
					width: 100%;
				}';
		$placeHolderWeight = 'Kilogram';		
		$placeHolderHeight = 'Centimeter';		
		}
		
		if($fcw_calculator_type == 'standard') { 		
			$html .= '#fcp-water-intake-form .fcp-radio-btn {
						width: 100%;
					}';
		$placeHolderWeight = 'Pound';		
		$placeHolderHeight = 'Feet';		
		}
				
		$html .= '#fcp-water-intake-form h3 {
				    text-transform: uppercase;
				    background-color: '.$fcw_theme_color.';
				    padding: 2%;
				    color: #fff;
				    font-weight: bolder;
				    text-align: center;
				    margin: 0px;
				}
				#fcp-water-intake-form .fcp-result-string {
				    background-color: '.$fcw_theme_color.';
				    padding: 1%;
				    color: #fff;
				    font-size: 20px;
				    text-align: center;
				    margin: 0px;
				}
				#fcp-water-intake-form .fcp-btn {
				    background-color: '.$fcw_theme_color.';
				    color: #fff;
				    text-transform: uppercase;
				    border-radius: 4px;
				    border: solid 2px '.$fcw_theme_color.';
				}
				</style><div id="fcp-water-intake-form" class="container">
				<h3><span id="daily_Water_intake_calculator">'.$fcw_title.'</span></h3>	
			  <div class="fcp-row">';
			if( $fcw_calculator_type == 'metric' ||  $fcw_calculator_type == 'both') {		  
			$html .=  '<div class="fcp-radio-btn fcp-radio-btn-metric">
			  			<label for="fcp-water-intake-radio-metric">'. __( 'Metric', 'fitness-calculators' ).'</label>
			  			<input type="radio" id="fcp-water-intake-radio-metric" 
						  class="form-control fcp-water-radio" name="fcp-water-intake-radio" 
						  checked
						  value="metric">
			  			<span class="fcp-error">require</span>
					</div>';
			}
			if( $fcw_calculator_type == 'standard'  ||  $fcw_calculator_type == 'both') {		  
			$html .= '<div class="fcp-radio-btn fcp-radio-btn-standard">
			  			<label for="fcp-water-intake-radio-imperial">'. __( 'Standard', 'fitness-calculators' ).'</label>
			  			 <input type="radio" id="fcp-water-intake-radio-imperial" 
						   class="form-control fcp-water-radio" name="fcp-water-intake-radio" 
						   checked
						   value="imperial" >
			  			<span class="fcp-error">require</span>
						  </div>';
			}			  

			$html .= '<table class="fcp-table">
			  			<tbody><tr>
			  				<td>
			  					<label for="fcp-water-intake-age">'. __( 'Age', 'fitness-calculators' ).'</label>
							    <select id="fcp-water-intake-age" class="left form-control" name="fcp-water-intake-age">
							    	<option value="14-18">14-18</option>
							    	<option value="19-30">19-30</option>
							    	<option value="31-50">31-50</option>
							    	<option value="50+">50+</option>
							    </select>
			  				</td>
			  				<td>
			  					<label for="fcp-water-intake-sex">'. __( 'Sex', 'fitness-calculators' ).'</label>
							    <select id="fcp-water-intake-sex" class="left  form-control" name="fcp-water-intake-sex">
							    	<option value="male">'. __( 'Male', 'fitness-calculators' ).'</option>
							    	<option value="female">'. __( 'Female', 'fitness-calculators' ).'</option>
							    </select>
			  				</td>
			  			</tr>
			  			<tr>
			  				<td>
			  					<label for="fcp-water-intake-height">'. __( 'Height', 'fitness-calculators' ) .'</label>
						    	<input id="fcp-water-intake-height" pattern="[0-9]" type="text" class="left  form-control" 
								name="fcp-water-intake-height" placeholder="'.$placeHolderHeight.'">
						    	<span id="fcp-water-intake-height-error" class="fcp-error">require</span>
			  				</td>
			  				<td>
			  					<label for="fcp-water-intake-weight">'. __( 'Weight', 'fitness-calculators' ) .'</label>
						    	<input id="fcp-water-intake-weight" pattern="[0-9]" type="text" class="left form-control" 
								name="fcp-water-intake-weight" placeholder="'. $placeHolderWeight .'">
						    	<span id="fcp-water-intake-weight-error" class="fcp-error">require</span>
			  				</td>
			  			</tr>
			  			<tr>
			  				<td>
			  					<label for="fcp-water-intake-season">'. __( 'Season', 'fitness-calculators' ) .'</label>
							    <select id="fcp-water-intake-season" class="left  form-control" name="fcp-water-intake-season">
							    	<option value="winter">'. __( 'Winter', 'fitness-calculators' ).'</option>
							    	<option value="normal">'. __( 'Normal', 'fitness-calculators' ).'</option>
							    	<option value="summer">'. __( 'Summer', 'fitness-calculators' ).'</option>
							    </select>
			  				</td>
			  				<td>
			  					<label for="fcp-water-intake-activity-level">'. __( 'Activity level', 'fitness-calculators' ) .'</label>
							    <select id="fcp-water-intake-activity-level" class="left form-control" name="fcp-water-intake-activity-level">
							    	<option value="lightly-active">'. __( 'Lightly active', 'fitness-calculators' ).'</option>
							    	<option value="moderately-active">'. __( 'Moderately active', 'fitness-calculators' ).'</option>
							    	<option value="very-active">'. __( 'Very Active', 'fitness-calculators' ).'</option>
							    </select>
			  				</td>
			  			</tr>
			  			<tr style="text-align: center;"><td colspan="2"><button onclick="fcpCalculateWaterIntake()" class="btn btn-default fcp-btn">'. __( 'Calculate', 'fitness-calculators' ) .'</button></td></tr>
			  		</tbody></table>
			  		<p class="fcp-result-string">'. __( 'you should drink ', 'fitness-calculators' ) .'<span class="fcp-calculated-result">......</span> '.  __( ' of water per day', 'fitness-calculators' ) .' </p>

			  </div>
		</div>';

		return $html;
	}


	public static function fcp_protein_intake_calculator( $atts, $content = "" ) { 
		$fcp_title = __( 'No title', 'fitness-calculators' );
		if(trim(get_option('fcp_heading'))!=false)
		{
			$fcp_title = get_option('fcp_heading');	
		}

		$fcp_metric_only = '';
		if(trim(get_option('fcp_metric_only'))!=false)
		{
			$fcp_metric_only = get_option('fcp_metric_only');	
		}

		$fcp_theme_color = '#004d99';
		if(trim(get_option('fcp_theme_color'))!=false)
		{
			$fcp_theme_color = get_option('fcp_theme_color');	
		}
		$html = '';
		$html .=  '<style>
				#fcp-protein-intake-form {
				    margin: 0px;
				    padding: 0px;
				    border: solid 2px '.$fcp_theme_color.';
				    width: 100%;
				    float: left;
				}';

		if($fcp_metric_only == 'yes') { 		
			$html .= '#fcp-protein-intake-form .fcp-radio-btn {
						width: 100%;
					}';
			}		

		$html .= '#fcp-protein-intake-form h3 {
				    text-transform: uppercase;
				    background-color: '.$fcp_theme_color.';
				    padding: 2%;
				    color: #fff;
				    font-weight: bolder;
				    text-align: center;
				    margin: 0px;
				}
				
				#fcp-protein-intake-form .fcp-result-string {
				    background-color: '.$fcp_theme_color.';
				    padding: 1%;
				    color: #fff;
				    font-size: 20px;
				    text-align: center;
				    margin: 0px;
				}
				#fcp-protein-intake-form .fcp-btn {
				    background-color: '.$fcp_theme_color.';
				    color: #fff;
				    text-transform: uppercase;
				    border-radius: 4px;
				    border: solid 2px '.$fcp_theme_color.';
				}
				</style><div id="fcp-protein-intake-form" class="container">
				<h3>'.$fcp_title.'</h3>	
			  <div class="fcp-row">
			  		<div class="fcp-radio-btn fcp-radio-btn-protein-metric">
			  			<label for="fcp-protein-intake-radio-metric">'. __( 'Metric', 'fitness-calculators' ) .'</label>
			  			 <input type="radio"  id="fcp-protein-intake-radio-metric" class="form-control fcp-protein-radio" name="fcp-protein-intake-radio" value="metric">
			  			<span class="fcp-error">require</span>
			  		</div>';
		if($fcp_metric_only == 'no') {	
		$html .= '<div class="fcp-radio-btn fcp-radio-btn-protein-standard">
			  			<label for="fcp-protein-intake-radio-imperial">'. __( 'Standard', 'fitness-calculators' ) .'</label>
			  			 <input type="radio" id="fcp-protein-intake-radio-imperial" class="form-control fcp-protein-radio" name="fcp-protein-intake-radio" value="imperial">
			  			<span class="fcp-error">require</span>
					  </div>';
		}
		
		$html .= '<table class="fcp-table">
			  			<tr>
			  				<td>
			  					<label for="fcp-protein-intake-age">'. __( 'Age', 'fitness-calculators' ) .'</label>
							    <input type="text" id="fcp-protein-intake-age" class="left form-control" name="fcp-protein-intake-age" />
							    <span id="fcp-protein-intake-age-error" class="fcp-error">'. __( 'age should be in 14 to 80 range', 'fitness-calculators' ) .'</span>
			  				</td>
			  				<td>
			  					<label for="fcp-protein-intake-sex">'. __( 'Sex', 'fitness-calculators' ) .'</label>
							    <select id="fcp-protein-intake-sex" class="left  form-control" name="fcp-protein-intake-sex">
							    	<option value="male">'. __( 'Male', 'fitness-calculators' ).'</option>
							    	<option value="female">'. __( 'Female', 'fitness-calculators' ).'</option>
							    </select>
			  				</td>
			  			</tr>
			  			<tr>
			  				<td>
			  					<label for="fcp-protein-intake-height">'. __( 'Height', 'fitness-calculators' ) .'</label>
						    	<input  id="fcp-protein-intake-height" pattern="[0-9]" type="text"  class="left  form-control" id="fcp-protein-intake-height" name="fcp-protein-intake-height" placeholder="Centimeter/Feet" />
						    	<span id="fcp-protein-intake-height-error" class="fcp-error">require</span>
			  				</td>
			  				<td>
			  					<label for="fcp-protein-intake-weight">'. __( 'Weight', 'fitness-calculators' ) .'</label>
						    	<input id="fcp-protein-intake-weight"  pattern="[0-9]" type="text" class="left form-control" id="fcp-protein-intake-weight" name="fcp-protein-intake-weight" placeholder="Kilogram/Pound" />
						    	<span id="fcp-protein-intake-weight-error" class="fcp-error">require</span>
			  				</td>
			  			</tr>
			  			<tr>
			  				<td>
			  					<label for="fcp-protein-intake-goal">'. __( 'Goal', 'fitness-calculators' ) .'</label>
							    <select id="fcp-protein-intake-goal" class="left  form-control" name="fcp-protein-intake-goal">
							    	<option value="fat-loss">'. __( 'Fat loss', 'fitness-calculators' ).'</option>
							    	<option value="maintenance">'. __( 'Maintenance', 'fitness-calculators' ).'</option>
							    	<option value="muscle-gain">'. __( 'Muscle gain', 'fitness-calculators' ).'</option>
							    </select>
			  				</td>
			  				<td>
			  					<label for="fcp-protein-intake-activity-level">'. __( 'Activity level', 'fitness-calculators' ) .'</label>
							    <select id="fcp-protein-intake-activity-level" class="left form-control" name="fcp-protein-intake-activity-level">
							    	<option value="sedentary">'. __( 'Sedentary', 'fitness-calculators' ).'</option>
							    	<option value="lightly-active">'. __( 'Lightly Active', 'fitness-calculators' ).'</option>
							    	<option value="moderately-active">'. __( 'Moderately Active', 'fitness-calculators' ).'</option>
							    	<option value="very-active">'. __( 'Very Active', 'fitness-calculators' ).'</option>
							    </select>
			  				</td>
			  			</tr>
			  			<tr style="text-align: center;"><td colspan="2"><button onclick="fcpCalculateproteinIntake()" class="btn btn-default fcp-btn">'. __( 'Calculate', 'fitness-calculators' ) .'</button></td></tr>
			  		</table>
			  		<p class="fcp-result-string">'. __( 'You should take', 'fitness-calculators' ) .' <span class=fcp-protein-calculated-result>......</span>  '. __( 'of protein per day', 'fitness-calculators' ) .'</p>

			  </div>
		</div>';
		return $html;
	}


	// for BMI calculator
	public static function fcp_bmi_calculator( $atts, $content = "" ) { 
		$fcbmi_title = __( 'no title', 'fitness-calculators' );
		if(trim(get_option('fcbmi_heading'))!=false)
		{
			$fcbmi_title = get_option('fcbmi_heading');	
		}

		$fcbmi_metric_only = '';
		if(trim(get_option('fcbmi_metric_only'))!=false)
		{
			$fcbmi_metric_only = get_option('fcbmi_metric_only');	
		}

		$fcbmi_theme_color = '#004d99';
		if(trim(get_option('fcbmi_theme_color'))!=false)
		{
			$fcbmi_theme_color = get_option('fcbmi_theme_color');	
		}
		$html = '';
		$html .= '<style>
				#fcp-bmi-intake-form {
				    margin: 0px;
				    padding: 0px;
				    border: solid 2px '.$fcbmi_theme_color.';
				    width: 100%;
				    float: left;
				}';
		
		if($fcbmi_metric_only == 'yes') { 		
			$html .= '#fcp-bmi-intake-form .fcp-radio-btn {
						width: 100%;
					}';
			}		

		$html .= '#fcp-bmi-intake-form h3 {
				    text-transform: uppercase;
				    background-color: '.$fcbmi_theme_color.';
				    padding: 2%;
				    color: #fff;
				    font-weight: bolder;
				    text-align: center;
				    margin: 0px;
				}
				
				#fcp-bmi-intake-form .fcp-result-string {
				    background-color: '.$fcbmi_theme_color.';
				    padding: 1%;
				    color: #fff;
				    font-size: 20px;
				    text-align: center;
				    margin: 0px;
				}
				#fcp-bmi-intake-form .fcp-btn {
				    background-color: '.$fcbmi_theme_color.';
				    color: #fff;
				    text-transform: uppercase;
				    border-radius: 4px;
				    border: solid 2px '.$fcbmi_theme_color.';
				}
				</style><div id="fcp-bmi-intake-form" class="container">
				<h3>'.$fcbmi_title.'</h3>	
			  <div class="fcp-row">
			  		<div class="fcp-radio-btn fcp-radio-btn-bmi-metric">
			  			<label for="fcp-bmi-intake-radio-metric">'. __( 'Metric', 'fitness-calculators' ) .'</label>
			  			 <input type="radio"  id="fcp-bmi-intake-radio-metric" class="form-control fcp-protein-radio" name="fcp-bmi-intake-radio" value="metric" checked="checked">
			  			<span class="fcp-error">require</span>
			  		</div>';
			if($fcbmi_metric_only == 'no') {
			$html .= '<div class="fcp-radio-btn fcp-radio-btn-bmi-standard">
			  			<label for="fcp-bmi-intake-radio-imperial">'. __( 'Standard', 'fitness-calculators' ) .'</label>
			  			 <input type="radio" id="fcp-bmi-intake-radio-imperial" class="form-control fcp-protein-radio" name="fcp-bmi-intake-radio" value="imperial">
			  			<span class="fcp-error">require</span>
					  </div>';
			}	  

			$html .= '<table class="fcp-table">
			  			<tr>
			  				<td>
			  					<label class="fcp-bmi-intake-height" for="fcp-bmi-intake-height">'. __( 'Height', 'fitness-calculators' ) .'</label>
						    	<input  id="fcp-bmi-intake-height" pattern="[0-9]" type="text"  class="left  form-control" id="fcp-bmi-intake-height" name="fcp-bmi-intake-height" />
						    	<span id="fcp-bmi-intake-height-error" class="fcp-error">require</span>
			  				</td>
			  				<td>
			  					<label for="fcp-bmi-intake-weight">'. __( 'Weight', 'fitness-calculators' ) .'</label>
						    	<input id="fcp-bmi-intake-weight"  pattern="[0-9]" type="text" class="left form-control" id="fcp-bmi-intake-weight" name="fcp-bmi-intake-weight" />
						    	<span id="fcp-bmi-intake-weight-error" class="fcp-error">require</span>
			  				</td>
			  			</tr>
			  			<tr style="text-align: center;"><td colspan="2"><button onclick="fcpCalculatebmiIntake()" class="btn btn-default fcp-btn">'. __( 'Calculate', 'fitness-calculators' ) .'</button></td></tr>
			  		</table>
			  		<p class="fcp-result-string">  '.  __( 'Your BMI is', 'fitness-calculators' ) .'<span class=fcp-bmi-calculated-result>......</span></p>
			  		<div id="bmiClassList">            	                
			                <table id="bmiResultTable" class="hide_result">
			                 <tbody><tr>
			                  <th>'. __( 'BMI', 'fitness-calculators' ) .'</th><th>'. __( 'Classification', 'fitness-calculators' ) .'</th>
			                 </tr>
			                 <tr class="">
			                  <td>less than 18.5:</td><td>'. __( 'Underweight', 'fitness-calculators' ).'</td>
			                 </tr><tr>
			                 </tr><tr class="bmiGreen">
			                  <td>18.5 - 24.9:</td><td>'. __( 'Normal weight', 'fitness-calculators' ).'</td>
			                 </tr>
			                 <tr class="">
			                  <td>25 - 29.9:</td><td>'. __( 'Overweight', 'fitness-calculators' ).'</td>
			                 </tr><tr>
			                 </tr><tr class="">
			                  <td>30 upwards:</td><td>'. __( 'Obese', 'fitness-calculators' ).'</td>
			                 </tr>     
			                </tbody></table>    
			        </div>

			  </div>
		</div>';
		return $html;
	}


	// for Body Fat calculator
	public static function fcp_bfc_calculator( $atts, $content = "" ) { 
		$fcbfc_title = __( 'No title', 'fitness-calculators' );
		if(trim(get_option('fcbfc_heading'))!=false)
		{
			$fcbfc_title = get_option('fcbfc_heading');	
		}

		$fcbfc_metric_only = '';
		if(trim(get_option('fcbfc_metric_only'))!=false)
		{
			$fcbfc_metric_only = get_option('fcbfc_metric_only');	
		}

		$fcbfc_theme_color = '#004d99';
		if(trim(get_option('fcbfc_theme_color'))!=false)
		{
			$fcbfc_theme_color = get_option('fcbfc_theme_color');	
		}
		$html = '';
		$html .= '<style>
				#fcp-bfc-intake-form {
				    margin: 0px;
				    padding: 0px;
				    border: solid 2px '.$fcbfc_theme_color.';
				    width: 100%;
				    float: left;
				}';
		
		if($fcbfc_metric_only == 'yes') { 		
			$html .= '#fcp-bfc-intake-form .fcp-radio-btn {
						width: 100%;
					}';
			}		

		$html .= '#fcp-bfc-intake-form h3 {
				    text-transform: uppercase;
				    background-color: '.$fcbfc_theme_color.';
				    padding: 2%;
				    color: #fff;
				    font-weight: bolder;
				    text-align: center;
				    margin: 0px;
				}
				
				#fcp-bfc-intake-form .fcp-result-string {
				    background-color: '.$fcbfc_theme_color.';
				    padding: 1%;
				    color: #fff;
				    font-size: 20px;
				    text-align: center;
				    margin: 0px;
				}
				#fcp-bfc-intake-form .fcp-btn {
				    background-color: '.$fcbfc_theme_color.';
				    color: #fff;
				    text-transform: uppercase;
				    border-radius: 4px;
				    border: solid 2px '.$fcbfc_theme_color.';
				}
				</style><div id="fcp-bfc-intake-form" class="container">
				<h3>'.$fcbfc_title.'</h3>	
			  <div class="fcp-row">
			  		<div class="fcp-radio-btn fcp-radio-btn-bfc-metric">
			  			<label for="fcp-bfc-intake-radio-metric">'. __( 'Metric', 'fitness-calculators' ) .'</label>
			  			 <input type="radio"  id="fcp-bfc-intake-radio-metric" class="fcp-protein-radio-metric form-control fcp-protein-radio" name="fcp-bfc-intake-radio" checked="checked" value="metric">
			  			<span class="fcp-error">require</span>
			  		</div>';
			if($fcbfc_metric_only == 'no') {
			$html .= '<div class="fcp-radio-btn fcp-radio-btn-bfc-standard">
			  			<label for="fcp-bfc-intake-radio-imperial">'. __( 'Standard', 'fitness-calculators' ) .'</label>
			  			 <input type="radio" id="fcp-bfc-intake-radio-imperial" class="fcp-protein-radio-standard form-control fcp-protein-radio" name="fcp-bfc-intake-radio" value="imperial">
			  			<span class="fcp-error">require</span>
					  </div>';
			}
					  
			$html .= '<table class="fcp-table">
			  			<tr>
			  				<td>
			  					<label for="fcp-bfc-male">	
			  					'. __( 'Male', 'fitness-calculators' ) .'
						    	<input value="male"  id="fcp-bfc-male"  type="radio"  class="left  form-control" id="fcp-bfc-male" name="fcp-bfc-gender" />
						    	<span id="fcp-bfc-male-error" class="fcp-error-gender">require</span>
						    	</label>
			  				</td>
			  				<td>
			  					<label for="fcp-bfc-female">
			  					'. __( 'Female', 'fitness-calculators' ) .'
						    	<input value="female" id="fcp-bfc-female"  type="radio" class="left form-control" id="fcp-bfc-female" name="fcp-bfc-gender"  />
						    	<span id="fcp-bfc-female-error" class="fcp-error-gender">require</span>
						    	</label>
			  				</td>
			  			</tr>
			  			<tr>
			  				<td>
			  					<label class="fcp-bmi-intake-height" for="fcp-bfc-intake-height">'. __( 'Height', 'fitness-calculators' ) .'</label>
						    	<input  id="fcp-bfc-intake-height" 
						    				pattern="[0-9]" 
						    				type="text"  
						    				class="left  form-control"  
						    				name="fcp-bmi-intake-height"
						    				placeholder="Centimeter/Feet" />
						    	<span id="fcp-bfc-intake-height-error" class="fcp-error-height">require</span>
			  				</td>
			  				<td>
			  					<label for="fcp-bmi-intake-weight">'. __( 'Weight', 'fitness-calculators' ) .'</label>
						    	<input id="fcp-bfc-intake-weight"  pattern="[0-9]" type="text" class="left form-control" name="fcp-bfc-intake-weight" placeholder="'. __( 'Kilogram/Pound', 'fitness-calculators' ).'" />
						    	<span id="fcp-bfc-intake-weight-error" class="fcp-error-height">require</span>
			  				</td>
			  			</tr>
			  			<tr>
			  				<td>
			  					<label class="fcp-bfc-age" for="fcp-bfc-age">'. __( 'Age', 'fitness-calculators' ) .'</label>
						    	<input  id="fcp-bfc-age"  type="text"  class="left  form-control" name="fcp-bfc-age" />
						    	<span id="fcp-bfc-age-error" class="fcp-error-age">require</span>
			  				</td>
			  				<td>
			  					&nbsp;
			  				</td>
			  			</tr>
			  			<tr style="text-align: center;"><td colspan="2"><button onclick="fcpCalculatebfcIntake()" class="btn btn-default fcp-btn">'. __( 'Calculate', 'fitness-calculators' ) .'</button></td></tr>
			  		</table>
			  		<p class="fcp-result-string">'. __( 'Your body fat is ', 'fitness-calculators' ) .'  <span class=fcp-bfc-calculated-result>......</span></p>
			  		<div id="bmiClassList">            	                
			                <table id="bfcResultTable" class="hide_result">
			                 <tbody><tr>
			                  <th>'. __( 'Description', 'fitness-calculators' ) .'</th><th>'. __( 'Women', 'fitness-calculators' ) .'</th><th>'. __( 'Men', 'fitness-calculators' ) .'</th>
			                 </tr>
			                 <tr class="">
			                  <td>'. __( 'Recommended amount', 'fitness-calculators' ) .':</td><td>20-25%</td><td>8-14%</td>
			                 </tr><tr>
			                 </tr><tr class="bmiGreen">
			                  <td>'. __( 'Adults in United States, average', 'fitness-calculators' ) .' :</td><td>22-25%</td><td>15-19%</td>
			                 </tr>
			                 <tr class="">
			                  <td>'. __( 'Obese', 'fitness-calculators' ) .' :</td><td>30+%</td><td>25+%</td>
			                 </tr>           
			                </tbody></table>    
			        </div>

			  </div>
		</div>';
		return $html;
	}

	public static function fcp_cc_calculator( $atts, $content = "" ) { 
		$fccc_title = __( 'No title', 'fitness-calculators' );
		if(trim(get_option('fccc_heading'))!=false)
		{
			$fccc_title = get_option('fccc_heading');	
		}

		$fccc_metric_only = '';
		if(trim(get_option('fccc_metric_only'))!=false)
		{
			$fccc_metric_only = get_option('fccc_metric_only');	
		}

		$fccc_theme_color = '#004d99';
		if(trim(get_option('fccc_theme_color'))!=false)
		{
			$fccc_theme_color = get_option('fccc_theme_color');	
		}
		$html = '';
		$html .= '<style>
				#fcp-bfc-intake-form {
				    margin: 0px;
				    padding: 0px;
				    border: solid 2px '.$fccc_theme_color.';
				    width: 100%;
				    float: left;
				}';
		
		if($fccc_metric_only == 'yes') { 		
			$html .= '#fcp-bfc-intake-form .fcp-radio-btn {
						width: 100%;
					}';
			}		

		$html .= '#fcp-bfc-intake-form h3 {
				    text-transform: uppercase;
				    background-color: '.$fccc_theme_color.';
				    padding: 2%;
				    color: #fff;
				    font-weight: bolder;
				    text-align: center;
				    margin: 0px;
				}
				
				#fcp-bfc-intake-form .fcp-result-string {
				    background-color: '.$fccc_theme_color.';
				    padding: 1%;
				    color: #fff;
				    font-size: 20px;
				    text-align: center;
				    margin: 0px;
				}
				#fcp-bfc-intake-form .fcp-btn {
				    background-color: '.$fccc_theme_color.';
				    color: #fff;
				    text-transform: uppercase;
				    border-radius: 4px;
				    border: solid 2px '.$fccc_theme_color.';
				}
				</style><div id="fcp-bfc-intake-form" class="container">
				<h3>'.$fccc_title.'</h3>	
			  <div class="fcp-row">
			  		<div class="fcp-radio-btn fcp-radio-btn-cc-metric">
			  			<label for="fcp-cc-radio-metric">'. __( 'Metric', 'fitness-calculators' ) .'</label>
			  			 <input type="radio"  id="fcp-cc-radio-metric" class="fcp-cc-radio-metric form-control fcp-cc-radio" name="fcp-cc-radio" checked="checked" value="metric">
			  			<span class="fcp-error">require</span>
			  		</div>';
			if($fccc_metric_only == 'no') {
			$html .= '<div class="fcp-radio-btn fcp-radio-btn-cc-standard">
			  			<label for="fcp-cc-radio-imperial">'. __( 'Standard', 'fitness-calculators' ) .'</label>
			  			 <input type="radio" id="fcp-cc-radio-imperial" class="fcp-cc-radio-standard form-control fcp-cc-radio" name="fcp-cc-radio" value="imperial">
			  			<span class="fcp-error">require</span>
					  </div>';
			}
					  
			$html .= '<table class="fcp-table">
			  			<tr>
			  				<td>
			  					<label for="fcp-cc-male">	
			  					'. __( 'Male', 'fitness-calculators' ) .'
						    	<input value="male"  id="fcp-cc-male"  type="radio"  class="left  form-control" id="fcp-cc-male" name="fcp-cc-gender" />
						    	<span id="fcp-cc-male-error" class="fcp-error-gender">require</span>
						    	</label>
			  				</td>
			  				<td>
			  					<label for="fcp-cc-female">
			  					'. __( 'Female', 'fitness-calculators' ) .'
						    	<input value="female" id="fcp-cc-female"  type="radio" class="left form-control" id="fcp-cc-female" name="fcp-cc-gender"  />
						    	<span id="fcp-cc-female-error" class="fcp-error-gender">require</span>
						    	</label>
			  				</td>
			  			</tr>
			  			<tr>
			  				<td>
			  					<label class="fcp-cc-height" for="fcp-cc-height">'. __( 'Height', 'fitness-calculators' ) .'</label>
						    	<input  id="fcp-cc-height" 
						    				pattern="[0-9]" 
						    				type="text"  
						    				class="left  form-control"  
						    				name="fcp-cc-height"
						    				placeholder="Centimeter/Feet" />
						    	<span id="fcp-cc-height-error" class="fcp-error-height">require</span>
			  				</td>
			  				<td>
			  					<label for="fcp-cc-weight">'. __( 'Weight', 'fitness-calculators' ) .'</label>
						    	<input id="fcp-cc-weight"  pattern="[0-9]" type="text" class="left form-control" name="fcp-cc-weight" placeholder="'. __( 'Kilogram/Pound', 'fitness-calculators' ).'" />
						    	<span id="fcp-cc-weight-error" class="fcp-error-height">require</span>
			  				</td>
			  			</tr>
			  			<tr>
			  				<td>
			  					<label class="fcp-cc-age" for="fcp-cc-age">'. __( 'Age', 'fitness-calculators' ) .'</label>
						    	<input  id="fcp-cc-age"  type="text"  class="left  form-control" name="fcp-cc-age" />
						    	<span id="fcp-cc-age-error" class="fcp-error-age">require</span>
			  				</td>
			  				<td>
							  <label for="fcp-cc-activity-level">'. __( 'Activity level', 'fitness-calculators' ) .'</label>
							  <select id="fcp-cc-activity-level" class="left form-control" name="fcp-cc-activity-level">
							  		<option value="sedentary">'. __( 'Sedentary', 'fitness-calculators' ).'</option>
							  		<option value="lightly-active">'. __( 'Lightly active', 'fitness-calculators' ).'</option>
								  <option value="moderately-active">'. __( 'Moderately active', 'fitness-calculators' ).'</option>
								  <option value="very-active">'. __( 'Very Active', 'fitness-calculators' ).'</option>
								  <option value="extra-active">'. __( 'Extra active', 'fitness-calculators' ).'</option>
							  </select>
			  				</td>
			  			</tr>
			  			<tr style="text-align: center;"><td colspan="2"><button onclick="fcpCalculateccIntake()" class="btn btn-default fcp-btn">'. __( 'Calculate', 'fitness-calculators' ) .'</button></td></tr>
			  		</table>
			  		<p class="fcp-result-string">'. __( 'Your body Carb requirment ', 'fitness-calculators' ) .'  <span class=fcp-cc-calculated-result>......</span></p>
			  		<div id="ccClassList">            	                
			                <table id="ccResultTable" class="hide_result" cellspacing="20">
			                 <tbody>
			                 <tr>
							 <td style="padding:5%;">
							 <p> '. __( 'The calorie count is then adjusted based on your goal:', 'fitness-calculators' ) . ' </p>
							 <ul>	
							 <li>'. __( 'Weight loss: Reduce by 10-20%', 'fitness-calculators' ) . ' </li>
							 <li>'. __( 'Weight gain: Add 500 calories', 'fitness-calculators' ) . ' </li>
							 <li>'. __( 'Weight maintenance: Unchanged', 'fitness-calculators' ) . ' </li>
							 
							 <p>'. __( 'This calorie count is split into macronutrient percentages in the following ratios, based on splits commonly recommended by our nutrition experts for muscle gain, weight loss, and weight maintenance. (Yes, weight gain and maintenance are the same ratio, but the calories and macros are different.) ', 'fitness-calculators' ) . ' </p>
							 <ul>
							 <li>'. __( 'Weight loss: 40/40/20 (carbohydrates/protein/fats)', 'fitness-calculators' ) . ' </li>
							 <li>'. __( 'Weight gain: 40/30/30', 'fitness-calculators' ) . ' </li>
							 <li>'. __( 'Weight maintenance: 40/30/30', 'fitness-calculators' ) . ' </li>
							 </ol>
							 
							 <p>'. __( 'Finally, your carbohydrate intake comes from applying those percentages to your daily calorie number. Each gram of carbohydrates is "worth" 4 calories.', 'fitness-calculators' ) . ' </p>
							 </td>
			                 </tr>           
			                </tbody></table>    
			        </div>

			  </div>
		</div>';
		return $html;
	}

 }

 // shortcode for water intake calculator
 add_shortcode( 'fcp-water-intake-calculator', array( 'FcpShortCodes', 'fcp_water_intake_calculator' ) );

 // shortcode for protein intake calculator
 add_shortcode( 'fcp-protein-intake-calculator', array( 'FcpShortCodes', 'fcp_protein_intake_calculator' ) );

 // shortcode for bmi calculator
 add_shortcode( 'fcp-bmi-calculator', array( 'FcpShortCodes', 'fcp_bmi_calculator' ) );

 // shortcode for Body Fat
 add_shortcode( 'fcp-bfc-calculator', array( 'FcpShortCodes', 'fcp_bfc_calculator' ) );

 add_shortcode( 'fcp-cc-calculator', array( 'FcpShortCodes', 'fcp_cc_calculator' ) );
 
 ?>
