cmake_minimum_required(VERSION 3.22)

project(log_parser)

option(LP_O2 "Compile with -O2" OFF)
option(LP_O3 "Compile with -O3" OFF)
option(LP_ABSL_NODE "Use Abseil node map and set" OFF)
option(LP_ABSL_FLAT "Use Abseil flat map and set" OFF)
option(LP_STL_ORDERED "Use stl ordered map and set" OFF)
option(LP_STL_UNORDERED "Use stl unordered map and set" OFF)
option(LP_REGEX_STD "Use std::regex" OFF)
option(LP_REGEX_BOOST "Use boost::regex" OFF)
option(LP_REGEX_RE2 "Use RE2" OFF)
option(LP_REGEX_HYPERSCAN "Use Hyperscan" OFF)

set(CMAKE_THREAD_PREFER_PTHREAD ON)
set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)

if (LP_REGEX_BOOST)
	find_package(Boost REQUIRED COMPONENTS regex)
endif()

if (LP_O2)
	add_compile_options(-O2)
elseif(LP_O3)
	add_compile_options(-O3)
endif()

# Abseil requires C++11
set(CMAKE_CXX_STANDARD 17)

# Process Abseil's CMake build system
include(FetchContent)
FetchContent_Declare(
	abseil-cpp
	GIT_REPOSITORY https://github.com/abseil/abseil-cpp.git
	GIT_TAG 78be63686ba732b25052be15f8d6dee891c05749 # 20230125.0
)
FetchContent_Declare(
	re2
	GIT_REPOSITORY https://github.com/google/re2.git
	GIT_TAG b025c6a3ae05995660e3b882eb3277f4399ced1a # 2023-02-01
)
FetchContent_Declare(
	hs
	GIT_REPOSITORY https://github.com/intel/hyperscan.git
	GIT_TAG c37166d52ba5634886cd5ae73dcc81bb2de95872 # 5.4.1
)

if (LP_ABSL_NODE OR LP_ABSL_FLAT)
	FetchContent_MakeAvailable(abseil-cpp)
endif()

if (LP_REGEX_RE2)
	FetchContent_MakeAvailable(re2)
endif()
if (LP_REGEX_HYPERSCAN)
	# Require libboost-dev ragel pre-installed
	FetchContent_MakeAvailable(hs)
endif()

# Hyperscan integration is experimental, splitting into a different file for now
if (LP_REGEX_HYPERSCAN)
	add_executable(log_parser log_parser_hs.cpp)
else()
	add_executable(log_parser log_parser.cpp)
endif()
target_link_libraries(log_parser Threads::Threads)

if (LP_O2)
	target_compile_definitions(log_parser PRIVATE LP_O2)
elseif(LP_O3)
	target_compile_definitions(log_parser PRIVATE LP_O3)
endif()

if (LP_STL_UNORDERED)
	target_compile_definitions(log_parser PRIVATE LP_STL_UNORDERED)
elseif (LP_STL_ORDERED)
	target_compile_definitions(log_parser PRIVATE LP_STL_ORDERED)
elseif (LP_ABSL_NODE)
	target_compile_definitions(log_parser PRIVATE LP_ABSL_NODE)
	target_link_libraries(log_parser absl::hash)
	target_link_libraries(log_parser absl::node_hash_map absl::node_hash_set)
elseif (LP_ABSL_FLAT)
	target_compile_definitions(log_parser PRIVATE LP_ABSL_FLAT)
	target_link_libraries(log_parser absl::hash)
	target_link_libraries(log_parser absl::flat_hash_map absl::flat_hash_set)
endif()


if (LP_REGEX_BOOST)
	target_compile_definitions(log_parser PRIVATE LP_REGEX_BOOST)
	target_include_directories(log_parser PRIVATE ${Boost_INCLUDE_DIRS})
	target_link_libraries(log_parser Boost::regex)
elseif (LP_REGEX_STD)
	target_compile_definitions(log_parser PRIVATE LP_REGEX_STD)
elseif (LP_REGEX_RE2)
	target_compile_definitions(log_parser PRIVATE LP_REGEX_RE2)
	target_link_libraries(log_parser re2)
elseif (LP_REGEX_HYPERSCAN)
	target_compile_definitions(log_parser PRIVATE LP_REGEX_HYPERSCAN)
	target_link_libraries(log_parser hs)
endif()
