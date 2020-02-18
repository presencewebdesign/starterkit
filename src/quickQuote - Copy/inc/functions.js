function api_redirect_url(formID, json, defaultquotetype) {

    // this line will check if the argument is undefined, null, or false
    // if so set it to default value, otherwise set it to it's original value
    var formID = formID || "#quoteForm";
    var defaultquotetype = defaultquotetype || null;
    var results_url = "";
    var endpoint_url = "";
    var endpoint_doc_url = "";
    var ga_name = "";
    var formID = formID.selector;

    var data = JSON.parse(json);

    console.log(data)

    if (defaultquotetype == "CHI" || data.defaultquotetype == "CHI") {
        results_url = corp_results_url;
        endpoint_url = corp_api_url;
        ga_name = "Corporate Health Insurance";
    }
    else if (data.defaultquotetype == "SHI") {
        results_url = shi_results_url;
        endpoint_url = sport_shi_api_url;
        ga_name = "Sports Health Insurance";
    }
    else if (data.defaultquotetype == "SAI" && data.IndividualTeam == "I") {
        results_url = sai_results_url;
        endpoint_url = sport_sai_Individual_api_url;
        ga_name = "Sports Accident Insurance";
    }
    else if (data.defaultquotetype == "SAI" && data.IndividualTeam == "T") {
        results_url = sai_results_url;
        endpoint_url = sport_sai_team_url;
        ga_name = "Team Sport Accident Insurance";
    }
    else if (data.defaultquotetype == "SAI" && data.IndividualTeam == null) {
        results_url = sai_results_url;
        endpoint_url = sport_sai_team_url;
        ga_name = "Team Sport Accident Insurance";
    }
    else if (data.defaultquotetype == "ELIXIR") {
        endpoint_url = elixir_api_url;
        endpoint_doc_url = elixir_doc_url;

        ga_name = "ELIXIR Career Ending Insurance";
        json = removeMainMember(json)
        // remove commas on selected fields
        json = removeComma(json)

    }
    else {
        results_url = family_results_url;
        endpoint_url = family_api_url;
        ga_name = "Private Health Insurance";
    }

    var api = {
        results_url: results_url,
        endpoint_url: endpoint_url,
        ga_name: ga_name
    };

    notice(false, formID);

    // ID on Submit button
    var quoteFormSubmit = $('a#finish, #sportSubmit');
    // Disable submit button
    $(quoteFormSubmit).attr("disabled", "disabled");
    // Show loading cog
    $(quoteFormSubmit).html('<i class="fa fa-cog fa-spin"></i> Please wait...');
    //If there is a chance that the code will be run before the Hotjar script has loaded, you must add this line of code just before:
    //window.hj=window.hj||function(){(hj.q=hj.q||[]).push(arguments)};

    function addCommas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    var elixirJson = JSON.parse(json);

    $.ajax({
        type: 'post',
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        url: api.endpoint_url,
        data: json,
        success: function (response) {
            
            //hj('formSubmitSuccessful');
            //Set GA event for Quote Request
            ga('send', 'event', 'Quote Request', ga_name, '100387');

            if (data.defaultquotetype == "ELIXIR") {

                var years1Premium = "";
                var years2Premium = "";

                // Display html quote for Elixir
                if(response.premium1Year) {
                    var years1Premium = "<tr><td>1 Year Fixed Premium:</td><td class='orange'>&pound;"+ addCommas(response.premium1Year.toFixed(2)) +"</td></tr>"
                }

                if(response.premium2Year) {
                    var years2Premium = "<tr><td>2 Year Fixed Premium:</td><td class='orange'>&pound;"+ addCommas(response.premium2Year.toFixed(2)) +"</td></tr>"
                }

                notice(true, "#sportQuote", "<div id='elixir-results' class='row'> <div class='ref col-sm-7'> <p class='header'>Quote Reference: " + response.quoteRef + "</p><table class='nostyle'> " + years1Premium + years2Premium + " </table> <p>To apply, please ensure you have read the Elixir <a href='"+ endpoint_doc_url +"?Type=ipid-elixir&Date=" + elixirJson.StartDate + "'>Insurance Product Information Document</a> and <a href='"+ endpoint_doc_url +"/?Type=status-disclosure-sportsinsurance4u&Date=" + elixirJson.StartDate + "'>Status Disclosure</a>, then click 'Apply Now' to download and complete our application form.</p> </div><div class='col-sm-5 text-center'> <hr> <p class='header'>Annual Premium</p><p class='monthlyPremium'>&pound;"+ addCommas(response.premium1Year.toFixed(2)) +"</p><div class='center-block'> <a id='openElixirApplication' class='btn-block btn btn-success'>Apply Now</a> </div></div><div class='col-xs-12'><p style='padding-top: 20px; font-size: 12px'>You can choose to spread the cost of your insurance over 6 monthly instalments, which will be arranged via Premium Credit and is subject to additional charges. If you would like more information on this please contact us, so we can provide you with a more detailed illustration. Please <a target='_blank' href='https://www.sportsinsurance4u.com/media/2173/representative-example.pdf'>click here</a> to view a representative example for paying by instalments, which has been based on a premium of £5,000 per annum.</p></div></div>");
            
                $(quoteFormSubmit).html('Update My Quotes');
                $(quoteFormSubmit).removeAttr("disabled");

                $('#openElixirApplication').on('click', function (e) {
                    window.open('https://www.sportsinsurance4u.com/media/2166/elixir-career-ending-sports-insurance-application.pdf')
                })
            

            } else {
                //appSettings configure redirect url
                window.location.href = api.results_url + "?c=" + response.customer + "&r=" + response.group + "&i=" + response.introducer;
            }
        },
        error: function (response, json) {

            // remove disabled button
            $(quoteFormSubmit).removeAttr("disabled");
            // loop through field names and trigger the validation
            $(quoteFormSubmit).html('Show My Quotes');

            var messageHtml = "<ul class='requiredErrors'>";
            //messageHtml += "<p>*Validation errors</p>"  
            $.each(response.responseJSON, function (elem, message) {
                addErrors(elem, "This field is required.");
                //messageHtml += "<p><strong>"+elem+"</strong></p><li>" + message + "</li>"   
                messageHtml += "<li>" + message + "</li>"   
            });
            messageHtml += "</ul>";
            notice(true, formID, messageHtml, "error");

            // if certificate now valid
            if (typeof (response.responseJSON) == "undefined") {
                notice(true, formID, "Something has gone wrong, please contact the administrator", "error");
            }
        }
    });
}



function changeOptions(json) {
    json.elem = json.elem + "-GPregistration"
    let dropdown = $('#'+json.elem);

    dropdown.empty();
    dropdown.append('<option selected="true" disabled>Please select</option>');
    dropdown.prop('selectedIndex', 0);

    // Populate dropdown with list of provinces
    $.getJSON(gp_registration_api_url + "?startDate=" + json.StartDate + "&dob=" + json.DateOfBirth, function (data) {

        dropdown.empty();
        dropdown.html('<option selected="true" disabled>Please select</option>');

        if(data.length >= 1) {
            $.each(data, function (key, i) {
                dropdown.append($('<option></option>').attr('value', i.value).text(i.text));
                $('#' + json.elem + "-display").show()
            })
        } else {
            $('#' + json.elem + "-display").hide()
        }
    }).error(function(err) { 
        $('#' + json.elem + "-display").hide()
    })
    
}


// // FUNCTION Check if age is 16 or under 16
function getAge(myDate) {

    myDate=myDate.split("/");
    var newDate = myDate[2]+"/"+myDate[1]+"/"+myDate[0];
    var dateString = new Date(newDate).getTime();

    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// FUNCTION Hide/Show and disable fields
function displayOption(bool, element) {
    if(bool === false) {
        $(element).hide();
        $(element + "-display").hide();
        $(element + " input, " + element + " select").attr('disabled','disabled');
    }else{
        $(element).show();
        $(element + "-display").show();
        $(element + " input, " + element + " select").removeAttr('disabled');
    }
}

// FUNCTION Reset the Select Sports Activity buttons
function resetActivity(element, bool) {
    $(element).attr('checked', bool);
    displayOption(false, '.SHI');
    displayOption(false, '.SAI');
}

function brochureLink(type) {
    if (type == "PMI") {
        $("#brochureLink").attr("href", "/generalandmedical/media/1451/private-health-insurance-brochure.pdf");
    } else if (type == "SAI") {
        $("#brochureLink").attr("href", "/sports-insurance-uk/media/1921/sports-accident-insurance-brochure.pdf");
    } else if (type == "SHI") {
        $("#brochureLink").attr("href", "/sports-insurance-uk/media/1913/sports-health-insurance-brochure.pdf");
    } else if (type == "CHI") {
        $("#brochureLink").attr("href", "/generalandmedical/media/1679/corporate-health-insurance-brochure.pdf");
    } else if (type == "ELIXIR") {
        $("#brochureLink").attr("href", "/sports-insurance-uk/media/2165/elixir-career-ending-sports-insurance-brochure.pdf");
    }
}

// FUNCTION Hide/Show depending on the sport type
function sportType(type) {

    // GP registration
    displayOption(false, '#DateOfBirth-GPregistration');

    // hide Parent/Guardian Confirmation
    displayOption(false, '#checkBoxUnder16');

    // Reset dob
    $('.quoteForm').find('#DateOfBirth').not("#defaultQuoteType").val('');

    brochureLink(type);

    // Family Members
    displayOption(false, '#family');

    // Show dropdowns
    displayOption(false, '#SHI');
    displayOption(false, '#SAI');

    // Show buttons
    displayOption(false, '.SHI');
    displayOption(false, '.SAI');

    // Type of employment class
    displayOption(false, '#employmentclass');

    // Show Team details
    displayOption(false, '#teamInfo');

    // Show DateofBirth field
    // displayOption(true, '#DateOfBirth');

    // PMI existing cover and spouse dob
    displayOption(false, '#ExistingCover');
    displayOption(false, '#addSpouse');

    // Hide Corp and show default
    displayOption(false, '#CHI');
    displayOption(false, '#default');

    // Hide Spouse
    //displayOption(false, '#spouse-dob');

    // ELIXIR 
    displayOption(false, '#ELIXIR');

    if(type == "PMI" || type == "") {

        $('#quoteDescription').html('Private Health Insurance for you and your family.');

        // Family Members
        displayOption(true, '#family');
        displayOption(true, '#ExistingCover');
        displayOption(true, '#addSpouse');
        
        // Hide Corp and show default
        displayOption(true, '#default');

    } else if (type == "SAI") {

        $('#quoteDescription').html('Cash benefits for accidental injury and income protection cover, if you earn less than £10,000 a year from your sport.');

        resetActivity("#quoteForm input[name=IndividualTeam]", false);
        resetActivity("#quoteForm input[name=PlayerCoach]", false);

        // Family Members
        displayOption(false, '#family');

        // Show dropdowns
        displayOption(true, '#SAI');

        // Show buttons
        displayOption(true, '.SHI');

        // Hide Corp and show default
        displayOption(true, '#default');


    } else if (type == "SHI") {

        $('#quoteDescription').html('Private Health Insurance for you with important cover for sports injuries, for amateur and professional sportspeople.');

        // Family Members
        displayOption(false, '#family');

        // Show dropdowns
        displayOption(true, '#SHI');

        // Show buttons
        displayOption(true, '.SAI');

        // Hide Corp and show default
        displayOption(true, '#default');


    } else if (type == "CHI") {

        // Show Corporate
        displayOption(true, '#CHI');
        // Family Members
        displayOption(false, '#family');

    }  else if (type == "ELIXIR") {

        $('#quoteDescription').html('Elixir offers cover and benefits for professional football players if they receive a career ending injury.');

        // Show Corporate
        displayOption(true, '#ELIXIR');
        displayOption(true, '#default');

    }
}

function notice(display, formID, message, type) {

    $(formID+' #alertErrorBox').removeClass()

    if(type == "error") {
        type = "alert alert-danger"
    } else if (type == "success") {
        type = "alert alert-danger"
    } else {
        type = "alert alert-info"
    }

    if(display === true) {
        $(formID+' #alertErrorBox').addClass(type).show().html(message)
    } else {
        $(formID+' #alertErrorBox').removeClass(type).hide().empty();
    }
}

function addErrors(ele, message) {

    // check if the json
    let contains = ele.includes("MainMember");
    let contains_spouse = ele.includes("Spouse");
    let contains_familyMembers = ele.includes("FamilyMembers");

    if(contains) {
        var ele = ele.slice(11);
    }
    else if(contains_spouse) {
        var ele = ele.slice(0,6);
    }
    else if(contains_familyMembers) {
        var familyIndex = ele.match(/\d/g);
        var ele = "dob_family_" + familyIndex;
    }

    $('.quoteForm').validate().addErrors([{
        element: $("#" + ele + ", input[name=" + ele + "]"),
        message: message
    }]);
}
function AddFamilyMembers(json) {

    var check = JSON.parse(json);
    if(check["familyMembers"]) {
        // convert to Object
        var data = JSON.parse(json);
        var familyMembers_Data = Object.values(data["familyMembers"]);
        // Remove familyMembers origional
        delete data.familyMembers;
        // Add in FamilyMembers array format
        var familyMembers = [];
        data.familyMembers = familyMembers_Data;
        // Convert back to JSON
        var json = JSON.stringify(data);
    }

    return json;
}

function removeMainMember(json) {
    var data = JSON.parse(json);
    if(data.MainMember) {

        title = data.MainMember.title;
        data.title = title;

        firstName = data.MainMember.firstName;
        data.firstName = firstName;

        LastName = data.MainMember.LastName;
        data.LastName = LastName;

        DateOfBirth = data.MainMember.DateOfBirth;
        data.DateOfBirth = DateOfBirth;
    }

    // Remove familyMembers origional
    delete data.MainMember;
    var json = JSON.stringify(data);
    return json;
}

function removeComma(json) {
    var data = JSON.parse(json);

    BasicAnnualSalary = data.BasicAnnualSalary.replace(/[,]+/g, "").trim();
    SumInsured = data.SumInsured.replace(/[,]+/g, "").trim();

    data.BasicAnnualSalary = BasicAnnualSalary;
    data.SumInsured = SumInsured;

    var json = JSON.stringify(data);
    return json;
}

function dobFormat(json) {

    var data = JSON.parse(json);

    if(data.MainMember) {
        dateOfBirth = data.MainMember.DateOfBirth.split("-").reverse().join("-");
        data.MainMember.DateOfBirth = dateOfBirth;
    }
    if(data.DateOfBirth) {
        dateOfBirth = data.DateOfBirth.split("-").reverse().join("-");
        data.DateOfBirth = dateOfBirth;
    }
    if(data.contractEndDate) {
        contractEndDate = data.contractEndDate.split("-").reverse().join("-");
        data.contractEndDate = contractEndDate;
    }
    if(data.contractStartDate) {
        contractStartDate = data.contractStartDate.split("-").reverse().join("-");
        data.contractStartDate = contractStartDate;
    }
    if(data.StartDate) {
        startDate = data.StartDate.split("-").reverse().join("-");
        data.StartDate = startDate;
    }
    if(data.addSpouse) {
        spouseDateOfBirth = data.Spouse.DateOfBirth.split("-").reverse().join("-");
        data.Spouse.DateOfBirth = spouseDateOfBirth;
    }
    if(data.familyMembers) {
        count = 0;
        data.familyMembers.dateOfBirth
        data.familyMembers.forEach(function(i) {
            var integ = count++
            familyDateOfBirth = i.dateOfBirth.split("-").reverse().join("-");
            data.familyMembers[integ].dateOfBirth = familyDateOfBirth;
        });
    }

    var json = JSON.stringify(data);
    return json;
}

// Taken from webssite https://www.qodo.co.uk/blog/javascript-checking-if-a-date-is-valid/
function isValidDate(s) {

    // format D(D)/M(M)/(YY)YY
    var dateFormat = /^\d{1,4}[\.|\/|-]\d{1,2}[\.|\/|-]\d{1,4}$/;

    if (dateFormat.test(s)) {
        // remove any leading zeros from date values
        s = s.replace(/0*(\d*)/gi,"$1");
        var dateArray = s.split(/[\.|\/|-]/);
        
        // correct month value
        dateArray[1] = dateArray[1]-1;

        // correct year value
        if (dateArray[2].length<4) {
            // correct year value
            dateArray[2] = (parseInt(dateArray[2]) < 50) ? 2000 + parseInt(dateArray[2]) : 1900 + parseInt(dateArray[2]);
        }

        var testDate = new Date(dateArray[2], dateArray[1], dateArray[0]);
        if (testDate.getDate()!=dateArray[0] || testDate.getMonth()!=dateArray[1] || testDate.getFullYear()!=dateArray[2]) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}