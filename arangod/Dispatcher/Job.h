////////////////////////////////////////////////////////////////////////////////
/// DISCLAIMER
///
/// Copyright 2014-2016 ArangoDB GmbH, Cologne, Germany
/// Copyright 2004-2014 triAGENS GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is ArangoDB GmbH, Cologne, Germany
///
/// @author Dr. Frank Celler
/// @author Martin Schoenert
////////////////////////////////////////////////////////////////////////////////

#ifndef ARANGOD_DISPATCHER_JOB_H
#define ARANGOD_DISPATCHER_JOB_H 1

#include "Basics/Common.h"
#include "Basics/Exceptions.h"
#include "Statistics/StatisticsAgent.h"


namespace triagens {
namespace rest {
class DispatcherQueue;
class DispatcherThread;


////////////////////////////////////////////////////////////////////////////////
/// @brief abstract base class for jobs
////////////////////////////////////////////////////////////////////////////////

class Job : public RequestStatisticsAgent {
  Job(Job const&) = delete;
  Job& operator=(Job const&) = delete;

  
 public:
  //////////////////////////////////////////////////////////////////////////////
  /// @brief constructs a job
  //////////////////////////////////////////////////////////////////////////////

  explicit Job(std::string const& name);


  virtual ~Job();

  
 public:
  //////////////////////////////////////////////////////////////////////////////
  /// @brief gets the name
  /// Note: currently unused
  //////////////////////////////////////////////////////////////////////////////

  virtual std::string const& getName() const { return _name; }

  //////////////////////////////////////////////////////////////////////////////
  /// @brief returns the job id
  //////////////////////////////////////////////////////////////////////////////

  uint64_t jobId() const { return _jobId; }

  //////////////////////////////////////////////////////////////////////////////
  /// @brief sets the queue position
  //////////////////////////////////////////////////////////////////////////////

  void setQueuePosition(size_t id) { _queuePosition = id; }

  //////////////////////////////////////////////////////////////////////////////
  /// @brief returns the queue position
  //////////////////////////////////////////////////////////////////////////////

  size_t queuePosition() const { return _queuePosition; }

  
 public:
  //////////////////////////////////////////////////////////////////////////////
  /// @brief returns the queue name to use
  //////////////////////////////////////////////////////////////////////////////

  virtual size_t queue() const;

  //////////////////////////////////////////////////////////////////////////////
  /// @brief starts working
  //////////////////////////////////////////////////////////////////////////////

  virtual void work() = 0;

  //////////////////////////////////////////////////////////////////////////////
  /// @brief tries to cancel execution
  //////////////////////////////////////////////////////////////////////////////

  virtual bool cancel() = 0;

  //////////////////////////////////////////////////////////////////////////////
  /// @brief cleans up after work and delete
  //////////////////////////////////////////////////////////////////////////////

  virtual void cleanup(DispatcherQueue*) = 0;

  //////////////////////////////////////////////////////////////////////////////
  /// @brief handle error and delete
  //////////////////////////////////////////////////////////////////////////////

  virtual void handleError(basics::Exception const&) = 0;

  
 protected:
  //////////////////////////////////////////////////////////////////////////////
  /// @brief task id
  //////////////////////////////////////////////////////////////////////////////

  uint64_t const _jobId;

  
 private:
  //////////////////////////////////////////////////////////////////////////////
  /// @brief name of the job
  //////////////////////////////////////////////////////////////////////////////

  std::string const _name;

  //////////////////////////////////////////////////////////////////////////////
  /// @brief queue position
  //////////////////////////////////////////////////////////////////////////////

  size_t _queuePosition;
};
}
}

#endif


