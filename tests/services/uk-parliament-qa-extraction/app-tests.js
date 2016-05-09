"use strict";

const sinon = require("sinon"),
  mockery = require("mockery"),
  assert = require("chai").assert,
  cron = require("node-cron"),
  MongoDbStub = require("../../stubs/MongoDbStub"),
  RequestStub = require("../../stubs/RequestStub"),
  Sut = require("../../../services/uk-parliament-qa-extraction/app"),
  config = {
    qAAtomFeedUri: "http://api.data.parliament.uk/resources/files/feed?dataset=7",
    qAExtractCron: "* * * * * *"
  };

const mockAtomFeedResult = `
      <?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title type="text">Data.Parliament Resource File Feed</title>
        <id>http://api.data.parliament.uk/resources/files/feed</id>
        <updated>2016-05-03T20:25:18Z</updated>
        <link rel="self" href="http://data.parliament.uk/feed"/>
        <entry>
            <id>http://api.data.parliament.uk/resources/files/516939.pdf</id>
            <title type="text">Data.Parliament Resource File 516939 - pdf</title>
            <updated>2016-05-03T18:41:45+01:00</updated>
            <author>
                <name>Data.Parliament</name>
            </author>
            <link href="http://api.data.parliament.uk/resources/files/516939.pdf"/>
        </entry>
        <entry>
            <id>http://api.data.parliament.uk/resources/files/516939.xml</id>
            <title type="text">Data.Parliament Resource File 516939 - xml</title>
            <updated>2016-05-03T18:41:45+01:00</updated>
            <author>
                <name>Data.Parliament</name>
            </author>
            <link href="http://api.data.parliament.uk/resources/files/516939.xml"/>
        </entry>
      </feed>
    `;

const mockQADetailResult = `<?xml version="1.0" encoding="utf-8"?>
<DailyReport xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://data.parliament.uk/QnA/private/2013/02">
  <Date>2016-05-03Z</Date>
  <FromDate>2016-04-29T15:01:00</FromDate>
  <ToDate>2016-05-03T18:01:59.999</ToDate>
  <House>
    <HouseId xmlns="http://data.parliament.uk/QnA/2013/02">1</HouseId>
    <HouseName xmlns="http://data.parliament.uk/QnA/2013/02">Commons</HouseName>
  </House>
  <WebsitePdfUrl>http://qnadailyreport.blob.core.windows.net/qnadailyreportxml/Written-Questions-Answers-Statements-Daily-Report-Commons-2016-05-03.pdf</WebsitePdfUrl>
  <ReportQuestions>
    <ReportQuestion>
      <Heading>Higher Education</Heading>
      <Answer>
        <ParliamentNumber>56</ParliamentNumber>
        <SessionNumber>1</SessionNumber>
        <Session>2015-16</Session>
        <Uin>35759</Uin>
        <House>
          <HouseId xmlns="http://data.parliament.uk/QnA/2013/02">1</HouseId>
          <HouseName xmlns="http://data.parliament.uk/QnA/2013/02">House of Commons</HouseName>
        </House>
        <DateOfHoldingAnswer xsi:nil="true" />
        <DateAnswered>2016-05-03</DateAnswered>
        <QuestionFirstAnswered>2016-05-03T10:14:58.273Z</QuestionFirstAnswered>
        <DateOfMinisterialCorrection xsi:nil="true" />
        <QuestionFirstMinisteriallyCorrected xsi:nil="true" />
        <CurrentVersion>
          <AnswerId>58367</AnswerId>
          <Minister>
            <MemberId xmlns="http://data.parliament.uk/QnA/2013/02">4039</MemberId>
            <MemberName xmlns="http://data.parliament.uk/QnA/2013/02">Joseph Johnson</MemberName>
            <Constituency xmlns="http://data.parliament.uk/QnA/2013/02">Orpington</Constituency>
          </Minister>
          <AnsweringBody>
            <AnsweringBodyId xmlns="http://data.parliament.uk/QnA/2013/02">26</AnsweringBodyId>
            <AnsweringBodyName xmlns="http://data.parliament.uk/QnA/2013/02">Department for Business, Innovation and Skills</AnsweringBodyName>
            <AnsweringBodyShortName xmlns="http://data.parliament.uk/QnA/2013/02">Business, Innovation and Skills</AnsweringBodyShortName>
            <AnsweringBodySortName xmlns="http://data.parliament.uk/QnA/2013/02">Business, Innovation and Skills</AnsweringBodySortName>
          </AnsweringBody>
          <IsHoldingAnswer>false</IsHoldingAnswer>
          <QuestionVersionNumber>1</QuestionVersionNumber>
          <Text>&lt;p&gt;At the February European Council, the Government negotiated a new settlement, giving the United Kingdom a special status in a reformed European Union. The Government's position, as set out by my right hon. Friend the Prime Minister to the House on 22 February, is that the UK will be stronger, safer and better off remaining in a reformed EU.&lt;/p&gt;</Text>
          <LastUpdated>2016-05-03T10:14:31.463Z</LastUpdated>
          <IsMinisterialCorrection>false</IsMinisterialCorrection>
        </CurrentVersion>
        <PreviousVersions />
        <ReportCurrentAnsweredVersion>
          <AnswerId>58367</AnswerId>
          <Minister>
            <MemberId xmlns="http://data.parliament.uk/QnA/2013/02">4039</MemberId>
            <MemberName xmlns="http://data.parliament.uk/QnA/2013/02">Joseph Johnson</MemberName>
            <Constituency xmlns="http://data.parliament.uk/QnA/2013/02">Orpington</Constituency>
          </Minister>
          <AnsweringBody>
            <AnsweringBodyId xmlns="http://data.parliament.uk/QnA/2013/02">26</AnsweringBodyId>
            <AnsweringBodyName xmlns="http://data.parliament.uk/QnA/2013/02">Department for Business, Innovation and Skills</AnsweringBodyName>
            <AnsweringBodyShortName xmlns="http://data.parliament.uk/QnA/2013/02">Business, Innovation and Skills</AnsweringBodyShortName>
            <AnsweringBodySortName xmlns="http://data.parliament.uk/QnA/2013/02">Business, Innovation and Skills</AnsweringBodySortName>
          </AnsweringBody>
          <IsHoldingAnswer>false</IsHoldingAnswer>
          <QuestionVersionNumber>1</QuestionVersionNumber>
          <Text>&lt;p&gt;At the February European Council, the Government negotiated a new settlement, giving the United Kingdom a special status in a reformed European Union. The Government's position, as set out by my right hon. Friend the Prime Minister to the House on 22 February, is that the UK will be stronger, safer and better off remaining in a reformed EU.&lt;/p&gt;</Text>
          <LastUpdated>2016-05-03T10:14:31.463Z</LastUpdated>
          <IsMinisterialCorrection>false</IsMinisterialCorrection>
        </ReportCurrentAnsweredVersion>
      </Answer>
      <Question>
        <Uin xmlns="http://data.parliament.uk/QnA/2013/02">35759</Uin>
        <UpdatedDate xmlns="http://data.parliament.uk/QnA/2013/02">2016-04-27T21:27:20.897Z</UpdatedDate>
        <AnsweringBody xmlns="http://data.parliament.uk/QnA/2013/02">
          <AnsweringBodyId>26</AnsweringBodyId>
          <AnsweringBodyName>Department for Business, Innovation and Skills</AnsweringBodyName>
          <AnsweringBodyShortName>Business, Innovation and Skills</AnsweringBodyShortName>
          <AnsweringBodySortName>Business, Innovation and Skills</AnsweringBodySortName>
        </AnsweringBody>
        <House xmlns="http://data.parliament.uk/QnA/2013/02">
          <HouseId>1</HouseId>
          <HouseName>House of Commons</HouseName>
        </House>
        <TablingMember xmlns="http://data.parliament.uk/QnA/2013/02">
          <MemberId>4392</MemberId>
          <MemberName>Steven Paterson</MemberName>
          <Constituency>Stirling</Constituency>
        </TablingMember>
        <QuestionType xmlns="http://data.parliament.uk/QnA/2013/02">Ordinary</QuestionType>
        <RegisteredInterest xmlns="http://data.parliament.uk/QnA/2013/02">false</RegisteredInterest>
        <Session xmlns="http://data.parliament.uk/QnA/2013/02">2015-16</Session>
        <TabledDate xmlns="http://data.parliament.uk/QnA/2013/02">2016-04-27</TabledDate>
        <DateForAnswer xmlns="http://data.parliament.uk/QnA/2013/02">2016-05-03</DateForAnswer>
        <Target xmlns="http://data.parliament.uk/QnA/2013/02">The Secretary of State for Business, Innovation and Skills</Target>
        <Text xmlns="http://data.parliament.uk/QnA/2013/02">To ask the Secretary of State for Business, Innovation and Skills, what assessment he has made of the potential implications for UK Erasmus students, lecturers and research fellows of the UK leaving the EU.</Text>
        <SessionNumber xmlns="http://data.parliament.uk/QnA/2013/02">1</SessionNumber>
        <ParliamentNumber xmlns="http://data.parliament.uk/QnA/2013/02">56</ParliamentNumber>
        <VersionNumber xmlns="http://data.parliament.uk/QnA/2013/02">1</VersionNumber>
        <Url xmlns="http://data.parliament.uk/QnA/2013/02">http://www.parliament.uk/business/publications/written-questions-answers-statements/written-question/Commons/2016-04-27/35759</Url>
        <QuestionStatus xmlns="http://data.parliament.uk/QnA/2013/02">Tabled</QuestionStatus>
        <Heading xmlns="http://data.parliament.uk/QnA/2013/02">Higher Education</Heading>
      </Question>
      <Identifer>
        <Id>516154</Id>
        <IsAnswered>true</IsAnswered>
        <IsCorrected>false</IsCorrected>
        <House>Commons</House>
      </Identifer>
    </ReportQuestion>
  </ReportQuestions>
  <WrittenStatements>
    <WrittenStatement>
      <WrittenStatementId>2413</WrittenStatementId>
      <WrittenStatementBodyId>2489</WrittenStatementBodyId>
      <Wsid>HCWS709</Wsid>
      <Date>2016-05-03</Date>
      <AnsweringBody>
        <AnsweringBodyId xmlns="http://data.parliament.uk/QnA/2013/02">29</AnsweringBodyId>
        <AnsweringBodyName xmlns="http://data.parliament.uk/QnA/2013/02">Department for Work and Pensions</AnsweringBodyName>
        <AnsweringBodyShortName xmlns="http://data.parliament.uk/QnA/2013/02">Work and Pensions</AnsweringBodyShortName>
        <AnsweringBodySortName xmlns="http://data.parliament.uk/QnA/2013/02">Work and Pensions</AnsweringBodySortName>
      </AnsweringBody>
      <Minister>
        <MemberId xmlns="http://data.parliament.uk/QnA/2013/02">1554</MemberId>
        <MemberName xmlns="http://data.parliament.uk/QnA/2013/02">Stephen Crabb</MemberName>
        <Constituency xmlns="http://data.parliament.uk/QnA/2013/02">Preseli Pembrokeshire</Constituency>
      </Minister>
      <MinisterRole>The Secretary of State for Work and Pensions</MinisterRole>
      <Title>Universal Credit</Title>
      <Text>&lt;p&gt;I am pleased to inform the House that Universal Credit is now available in every Jobcentre across the country, having reached the final three Jobcentre Plus offices – Purley, Thornton Heath and Great Yarmouth – at the end of last month. This means Universal Credit is available for all new claims from single jobseekers wherever they are in Great Britain.&lt;/p&gt;&lt;p&gt;So far, over 450,000 people have made a claim to Universal Credit, with over 9,500 new claims made every week. The national roll-out means people in all parts of the country can now benefit from Universal Credit, which puts people at the heart of the welfare system for the first time.&lt;/p&gt;&lt;p&gt;As Universal Credit has rolled out, the positive difference it has made for those who claim it is clear. For example, those who are already receiving Universal Credit in comparison to a similar cohort receiving previous Jobeeker’s Allowance, people on Universal Credit spend 50% more time looking for work, they are 8 percentage points more likely to have found work or to be in work and when they are in work, they’re more likely to be earning more.&lt;/p&gt;&lt;p&gt; &lt;/p&gt;&lt;p&gt;Universal Credit makes it easier to start work and earn more because it:&lt;/p&gt;&lt;ul&gt;&lt;li&gt;&lt;strong&gt;Offers personalised support to progress in work&lt;/strong&gt;&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;Under the old system, as soon as someone moved into work, they were on their own. But with Universal Credit they can still get support. For the first time ever, Jobcentre Plus work coaches continue to support claimants in work, helping people increase their hours, earn more and progress in their chosen career.&lt;/p&gt;&lt;ul&gt;&lt;li&gt;&lt;strong&gt;Mirrors the world of work&lt;/strong&gt;&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;Like most jobs, Universal Credit is paid in a single monthly amount direct into people’s bank accounts, giving them control over their own money and making the move into work easier.&lt;/p&gt;&lt;p&gt; &lt;/p&gt;&lt;p&gt; &lt;/p&gt;&lt;p&gt; &lt;/p&gt;&lt;p&gt; &lt;/p&gt;&lt;ul&gt;&lt;li&gt;&lt;strong&gt;Helps with childcare costs&lt;/strong&gt;&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;Under Universal Credit, working families can claim back up to 85% of their childcare costs each month. This can be claimed up to a month before starting a job so people can focus on getting ready for work and so their child can settle into a new routine. For families with two children this could be worth up to £13,000 a year.&lt;/p&gt;&lt;ul&gt;&lt;li&gt;&lt;strong&gt;Stays with people as they move into work&lt;/strong&gt;&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;With Universal Credit, people’s claim remains open, even when they move into work. Unlike the old system, people can work as many hours as they want and take on short contracts without having to end their claim, helping to build up experience for a full time position.&lt;/p&gt;&lt;ul&gt;&lt;li&gt;&lt;strong&gt;Makes work pay&lt;/strong&gt;&lt;/li&gt;&lt;/ul&gt;&lt;p&gt;There are none of the cliff edges of the old system. As people’s earnings increase, their Universal Credit payments reduce at a steady rate, so they can be sure they will always be better off working and earning more.&lt;/p&gt;&lt;p&gt; &lt;/p&gt;&lt;p&gt;With Universal Credit rolled out nationally, more people will now be able to take advantage of this support and the unique features of Universal Credit, which is making work pay and is sweeping away the complexities, traps, and confusions of the previous system. Our focus now is continuing its expansion to all claimants.&lt;/p&gt;</Text>
      <House>
        <HouseId xmlns="http://data.parliament.uk/QnA/2013/02">1</HouseId>
        <HouseName xmlns="http://data.parliament.uk/QnA/2013/02">Commons</HouseName>
      </House>
      <ParliamentNumber>56</ParliamentNumber>
      <SessionNumber>1</SessionNumber>
      <SessionName>2015-16</SessionName>
      <Url>http://www.parliament.uk/business/publications/written-questions-answers-statements/written-statement/Commons/2016-05-03/HCWS709/</Url>
      <Attachments />
      <LastUpdated>2016-05-03T08:36:06.81Z</LastUpdated>
      <FirstSubmitted>2016-05-03T08:31:18.97Z</FirstSubmitted>
      <CorrectedStatements />
      <StatementInOtherHouse>
        <Wsid>HLWS688</Wsid>
        <Title>Universal Credit</Title>
        <Date>2016-05-03</Date>
        <IsSameSession>true</IsSameSession>
      </StatementInOtherHouse>
      <NoticeNumber>1</NoticeNumber>
      <DateStatementMade>2016-05-03T08:34:12.04</DateStatementMade>
      <DateStatementCorrected xsi:nil="true" />
    </WrittenStatement>
  </WrittenStatements>
  <UseDDPDirectly>false</UseDDPDirectly>
</DailyReport>`;



describe("UK parliament QnA app", function(){
  describe("app", function(){
    var sandbox,
      mongoDbStub,
      ensureIndexesStub,
      requestStub,
      cronStub,
      sut;
    before(function(){
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
      });
      mockery.registerAllowable("../../../services/uk-parliament-qa-extraction/app");
    });

    beforeEach(function () {
      // Create a sandbox for the test
      sandbox = sinon.sandbox.create();

      mongoDbStub = new MongoDbStub(sandbox);
      mockery.registerMock("promised-mongo", mongoDbStub.stub);

      ensureIndexesStub = sandbox.stub();
      mockery.registerMock("./ensure-mongodb-indexes", ensureIndexesStub);

      requestStub = new RequestStub(sandbox);
      requestStub.stub.hello = "world";
      mockery.registerMock("request-promise", requestStub.stub);

      mockery.registerMock("./config", config);

      cronStub = {
        schedule: sandbox.spy(cron.schedule)
      };
      mockery.registerMock("node-cron", cronStub);
    });

    afterEach(function () {
      // Restore all the things made through the sandbox
      sandbox.restore();
    });

    it("ensures indexes on startup", function *(){
      sut = new Sut();
      assert.isTrue(ensureIndexesStub.calledOnce, "Doesn't ensure indexes");
    });

    it("schedules data.pariament QnA Atom feed to be extracted at the correct schedule", function *(){
      sut = new Sut();
      assert.isTrue(cronStub.schedule.calledWith(config.qAExtractCron, sinon.match.any), "Doesn't schedule Atom feed extraction using correct cron config");
    });

    it("queries data.parliament QnA Atom feed periodically api periodically", function *(){
      var expectedRequestOptions = {
        uri: config.qAAtomFeedUri,
        method: "GET"
      };
      sut = new Sut();
      yield new Promise(function(resolve, reject){
        setTimeout(function(){
          assert.isTrue(requestStub.stub.calledWith(expectedRequestOptions), "Doesn't query data.parliament QnA Atom feed");
          resolve();
        }, 1000);
      });
    });

    it("queries data.parliament QnA xml data based on atom feed", function *(){
      var atomFeedOptions = {
          uri: "http://api.data.parliament.uk/resources/files/feed?dataset=7",
          method: "GET"
        },
        qADetailOptions = {
          uri: "http://api.data.parliament.uk/resources/files/516939.xml",
          method: "GET"
        };
      requestStub.stub.withArgs(atomFeedOptions).returns(Promise.resolve(mockAtomFeedResult));
      requestStub.stub.withArgs(qADetailOptions).returns(Promise.resolve(mockQADetailResult));
      sut = new Sut();
      yield new Promise(function(resolve, reject){
        setTimeout(function(){
          assert.equal(requestStub.stub.withArgs(atomFeedOptions).callCount, 1, "Doesn't query data.parliament QnA Atom feed item details");
          resolve();
        }, 2000);
      });
    });

    it("inserts transformed QnA xml data into mongo", function *(){
      var atomFeedOptions = {
          uri: "http://api.data.parliament.uk/resources/files/feed?dataset=7",
          method: "GET"
        },
        qADetailOptions = {
          uri: "http://api.data.parliament.uk/resources/files/516939.xml",
          method: "GET"
        },
        expectedUpdateData ={
          "parliamentDataId": 516154,
          "heading": "Higher Education",
          "answer": {
            "id": 58367,
            "member": {
              "id": 4039,
              "name": "Joseph Johnson",
              "constituency": "Orpington"
            },
            "answeringBody": {
              "id": 26,
              "name": "Department for Business, Innovation and Skills",
              "shortName": "Business, Innovation and Skills",
              "sortName": "Business, Innovation and Skills"
            },
            "text": "<p>At the February European Council, the Government negotiated a new settlement, giving the United Kingdom a special status in a reformed European Union. The Government's position, as set out by my right hon. Friend the Prime Minister to the House on 22 February, is that the UK will be stronger, safer and better off remaining in a reformed EU.<\/p>",
            "updated": new Date(1462270471463)
          },
          "question": {
            "id": 35759,
            "member": {
              "id": 4392,
              "name": "Steven Paterson",
              "constituency": "Stirling"
            },
            "targetBody": {
              "id": 26,
              "name": "Department for Business, Innovation and Skills",
              "shortName": "Business, Innovation and Skills",
              "sortName": "Business, Innovation and Skills"
            },
            "text": "To ask the Secretary of State for Business, Innovation and Skills, what assessment he has made of the potential implications for UK Erasmus students, lecturers and research fellows of the UK leaving the EU.",
            "updated": new Date(1461792440897)
          }
        };
      requestStub.stub.withArgs(atomFeedOptions).returns(Promise.resolve(mockAtomFeedResult));
      requestStub.stub.withArgs(qADetailOptions).returns(Promise.resolve(mockQADetailResult));
      sut = new Sut();
      yield new Promise(function(resolve, reject){
        setTimeout(function(){
          assert.isTrue(mongoDbStub.collectionStub.update.calledWith({ parliamentDataId: expectedUpdateData.parliamentDataId }, expectedUpdateData, { upsert: true }));
          resolve();
        }, 2000);
      });
    });

  });
});

